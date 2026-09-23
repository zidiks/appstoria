import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { StorageService } from './storage.service';
import { ProcessImageOptions } from './image-processing.service';
import { ProductDocument } from '../product/schema/product.schema';
import { SeoDTO } from '../shared/dto/seo.dto';
import {
  ImageJob,
  ImageJobCounters,
  ImageJobSummary,
  StoredImageResult,
} from './interfaces/image-job.interface';
import { ImageJobDocument, ImageJobEntity } from './schema/image-job.schema';

/** Сколько завершённых задач храним, чтобы админка могла вернуться к разбору ошибок */
const JOBS_HISTORY_LIMIT = 20;
/** Как часто владеющий процесс отмечается «я жив» */
const HEARTBEAT_INTERVAL = 5_000;
/** Без отметки дольше этого считаем, что процесс умер, и задачу можно хоронить */
const STALE_AFTER = 60_000;
/** Процесс жив, но ни один файл не досчитан так долго — предупреждаем админку */
const STALL_AFTER = 5 * 60_000;
/** Прогресс пишем в базу пачками: каждый файл — лишний поход в mongo */
const FLUSH_EVERY_FILES = 10;
const FLUSH_INTERVAL = 3_000;
/** Столько файлов в отчёте админка ещё осилит показать */
const WARNINGS_LIMIT = 500;
/** Файл считается подозрительно тяжёлым — такие пишем в лог, чтобы найти виновника */
const SLOW_FILE_MS = 20_000;

const MONGO_DUPLICATE_KEY = 11000;

/** Состояние задачи, которую крутит именно этот процесс */
interface RunningJob {
  id: string;
  counters: ImageJobCounters;
  warnings: StoredImageResult[];
  warningsTruncated: boolean;
  currentFile?: string;
  canceled: boolean;
  sinceFlush: number;
  flushedAt: number;
  heartbeat?: NodeJS.Timeout;
}

@Injectable()
export class ImageJobsService implements OnModuleDestroy {
  private readonly logger = new Logger(ImageJobsService.name);
  private running: RunningJob | null = null;

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ImageJobEntity.name)
    private readonly jobModel: Model<ImageJobDocument>,
    private readonly storageService: StorageService,
  ) {}

  onModuleDestroy() {
    if (this.running) {
      clearInterval(this.running.heartbeat);
    }
  }

  /** Обработка всех картинок одного товара — быстро, отвечаем сразу результатом */
  async processProduct(
    productId: string,
    options: ProcessImageOptions = {},
  ): Promise<ImageJobSummary> {
    const product = await this.productModel
      .findById(productId)
      .select('media seo.seoImage')
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException(`Товар ${productId} не найден`);
    }

    return this.processReferences(this.mediaOf(product), options);
  }

  async processFiles(
    files: string[],
    options: ProcessImageOptions = {},
  ): Promise<ImageJobSummary> {
    return this.processReferences(files, options);
  }

  async cropFile(
    file: string,
    crop: ProcessImageOptions['crop'],
  ): Promise<StoredImageResult> {
    const result = await this.storageService.processStoredImage(file, {
      crop,
      force: true,
    });
    await this.syncMediaReference(result);
    return result;
  }

  /** Массовая обработка идёт фоном: HTTP-запрос столько не живёт */
  async startAllProductsJob(
    options: ProcessImageOptions = {},
  ): Promise<ImageJob> {
    await this.reapStaleJobs();

    const references = await this.collectProductMedia();
    const now = new Date();

    let created: ImageJobDocument;
    try {
      created = await this.jobModel.create({
        jobId: nanoid(10),
        status: 'running',
        total: references.length,
        force: Boolean(options.force),
        startedAt: now,
        heartbeatAt: now,
        lastProgressAt: now,
      });
    } catch (error) {
      // Живая задача одна — это гарантирует уникальный индекс по status: running
      if (error?.code === MONGO_DUPLICATE_KEY) {
        throw new ConflictException('Обработка изображений уже запущена');
      }
      throw error;
    }

    await this.pruneJobs();
    void this.runJob(created.jobId, references, options);

    return this.toJob(created.toObject());
  }

  async getJob(jobId: string): Promise<ImageJob> {
    await this.reapStaleJobs();

    const job = await this.jobModel.findOne({ jobId }).lean().exec();
    if (!job) {
      throw new NotFoundException(`Задача ${jobId} не найдена`);
    }
    return this.toJob(job);
  }

  /**
   * Последняя задача — живая или уже завершённая. По ней админка переподключается
   * к прогрессу после перезахода и возвращается к разбору ошибок прошлого прогона.
   */
  async getCurrentJob(): Promise<ImageJob | null> {
    await this.reapStaleJobs();

    const job = await this.jobModel
      .findOne()
      .sort({ startedAt: -1 })
      .lean()
      .exec();

    return job ? this.toJob(job) : null;
  }

  async getJobs(): Promise<ImageJob[]> {
    await this.reapStaleJobs();

    const jobs = await this.jobModel
      .find()
      .sort({ startedAt: -1 })
      .limit(JOBS_HISTORY_LIMIT)
      .lean()
      .exec();

    return jobs.map((job) => this.toJob(job));
  }

  /**
   * Отмена: живой задаче ставим флаг, её цикл увидит его на ближайшем сбросе
   * прогресса. Если процесс-владелец уже мёртв — закрываем задачу сразу.
   */
  async cancelJob(jobId: string): Promise<ImageJob> {
    const job = await this.jobModel.findOne({ jobId }).lean().exec();
    if (!job) {
      throw new NotFoundException(`Задача ${jobId} не найдена`);
    }
    if (job.status !== 'running') {
      return this.toJob(job);
    }

    if (this.running?.id === jobId) {
      this.running.canceled = true;
    }

    const update = this.isStale(job)
      ? {
          status: 'canceled' as const,
          cancelRequested: true,
          finishedAt: new Date(),
          currentFile: undefined,
          error: 'Задача остановлена вручную: процесс обработки не отвечал',
        }
      : { cancelRequested: true };

    const updated = await this.jobModel
      .findOneAndUpdate({ jobId }, { $set: update }, { new: true })
      .lean()
      .exec();

    return this.toJob(updated);
  }

  private async runJob(
    jobId: string,
    references: string[],
    options: ProcessImageOptions,
  ) {
    const state: RunningJob = {
      id: jobId,
      counters: {
        total: references.length,
        processed: 0,
        unchanged: 0,
        skipped: 0,
        failed: 0,
      },
      warnings: [],
      warningsTruncated: false,
      canceled: false,
      sinceFlush: 0,
      flushedAt: Date.now(),
    };

    this.running = state;
    state.heartbeat = setInterval(() => {
      void this.beat(jobId);
    }, HEARTBEAT_INTERVAL);

    let status: ImageJob['status'] = 'done';
    let error: string | undefined;

    try {
      for (const reference of references) {
        if (state.canceled) {
          status = 'canceled';
          break;
        }

        state.currentFile = reference;
        const startedAt = Date.now();
        const result = await this.processReference(reference, options);
        const spent = Date.now() - startedAt;
        if (spent > SLOW_FILE_MS) {
          this.logger.warn(
            `Задача ${jobId}: файл ${reference} обрабатывался ${Math.round(spent / 1000)}с`,
          );
        }

        this.collectCounters(state, result);
        state.sinceFlush++;
        await this.flush(state);
      }
    } catch (err) {
      status = 'failed';
      error = err?.message ?? 'Неизвестная ошибка';
      this.logger.error(
        `Задача ${jobId} упала на файле ${state.currentFile}: ${error}`,
      );
    } finally {
      clearInterval(state.heartbeat);
      state.currentFile = undefined;
      this.running = null;

      try {
        await this.jobModel
          .updateOne(
            { jobId },
            {
              $set: {
                ...state.counters,
                warnings: state.warnings,
                warningsTruncated: state.warningsTruncated,
                status,
                error,
                currentFile: null,
                finishedAt: new Date(),
                heartbeatAt: new Date(),
                lastProgressAt: new Date(),
              },
            },
          )
          .exec();
      } catch (err) {
        this.logger.error(
          `Не удалось сохранить финал задачи ${jobId}: ${err?.message}`,
        );
      }
    }
  }

  /** Отметка «процесс жив»: идёт по таймеру и не зависит от того, сколько считается файл */
  private async beat(jobId: string) {
    try {
      await this.jobModel
        .updateOne({ jobId }, { $set: { heartbeatAt: new Date() } })
        .exec();
    } catch (error) {
      this.logger.warn(
        `Не удалось отметить задачу ${jobId} живой: ${error?.message}`,
      );
    }
  }

  /**
   * Прогресс в базу пишем пачками и тем же запросом забираем флаг отмены —
   * так отмена работает даже из другого инстанса.
   */
  private async flush(state: RunningJob) {
    const due =
      state.sinceFlush >= FLUSH_EVERY_FILES ||
      Date.now() - state.flushedAt >= FLUSH_INTERVAL;

    if (!due) {
      return;
    }

    state.sinceFlush = 0;
    state.flushedAt = Date.now();

    const updated = await this.jobModel
      .findOneAndUpdate(
        { jobId: state.id },
        {
          $set: {
            ...state.counters,
            warnings: state.warnings,
            warningsTruncated: state.warningsTruncated,
            currentFile: state.currentFile,
            heartbeatAt: new Date(),
            lastProgressAt: new Date(),
          },
        },
        { new: true, projection: { cancelRequested: 1 } },
      )
      .lean()
      .exec();

    if (updated?.cancelRequested) {
      state.canceled = true;
    }
  }

  /**
   * Задачи, чей процесс перестал отмечаться, закрываем: иначе мёртвая задача
   * навсегда блокирует запуск новой.
   */
  private async reapStaleJobs() {
    const threshold = new Date(Date.now() - STALE_AFTER);
    const result = await this.jobModel
      .updateMany(
        { status: 'running', heartbeatAt: { $lt: threshold } },
        {
          $set: {
            status: 'failed',
            error:
              'Обработка прервана: процесс сервера перестал отвечать (перезапуск или падение)',
            finishedAt: new Date(),
            currentFile: null,
          },
        },
      )
      .exec();

    if (result.modifiedCount) {
      this.logger.warn(
        `Закрыто зависших задач обработки изображений: ${result.modifiedCount}`,
      );
    }
  }

  private isStale(job: Pick<ImageJobEntity, 'heartbeatAt'>): boolean {
    return Date.now() - new Date(job.heartbeatAt).getTime() > STALE_AFTER;
  }

  private async processReferences(
    references: string[],
    options: ProcessImageOptions,
  ): Promise<ImageJobSummary> {
    const summary: ImageJobSummary = {
      total: 0,
      processed: 0,
      unchanged: 0,
      skipped: 0,
      failed: 0,
      results: [],
      warnings: [],
    };

    for (const reference of this.unique(references)) {
      summary.total++;
      this.collect(summary, await this.processReference(reference, options));
    }

    return summary;
  }

  private async processReference(
    reference: string,
    options: ProcessImageOptions,
  ): Promise<StoredImageResult> {
    const result = await this.storageService.processStoredImage(
      reference,
      options,
    );
    await this.syncMediaReference(result);
    return result;
  }

  private collect(summary: ImageJobSummary, result: StoredImageResult) {
    summary.results.push(result);

    if (this.countResult(summary, result)) {
      summary.warnings.push(result);
    }
  }

  private collectCounters(state: RunningJob, result: StoredImageResult) {
    if (!this.countResult(state.counters, result)) {
      return;
    }

    if (state.warnings.length >= WARNINGS_LIMIT) {
      state.warningsTruncated = true;
      return;
    }
    state.warnings.push(result);
  }

  /** Раскладывает результат по счётчикам. true — файл требует внимания админа */
  private countResult(
    counters: ImageJobCounters,
    result: StoredImageResult,
  ): boolean {
    if (result.status === 'processed') {
      counters.processed++;
      return false;
    }

    // Уже обработанное раньше — штатная ситуация, в warnings ему не место
    if (result.status === 'unchanged') {
      counters.unchanged++;
      return false;
    }

    if (result.status === 'skipped') {
      counters.skipped++;
    } else {
      counters.failed++;
    }
    return true;
  }

  /**
   * Если файл сменил расширение на .webp, ссылки в товарах нужно переписать.
   * Помимо media правим seo.seoImage: витрина берёт картинки галереи и og:image
   * именно оттуда, и без этого она осталась бы на старых необработанных файлах.
   */
  private async syncMediaReference(result: StoredImageResult) {
    if (
      result.status !== 'processed' ||
      !result.url ||
      result.url === result.file
    ) {
      return;
    }

    await this.productModel
      .updateMany(
        { media: result.file },
        { $set: { 'media.$[item]': result.url } },
        { arrayFilters: [{ item: result.file }] },
      )
      .exec();

    await this.productModel
      .updateMany(
        { 'seo.seoImage.imageName': result.file },
        { $set: { 'seo.seoImage.$[item].imageName': result.url } },
        { arrayFilters: [{ 'item.imageName': result.file }] },
      )
      .exec();
  }

  private async collectProductMedia(): Promise<string[]> {
    const products = await this.productModel
      .find()
      .select('media seo.seoImage')
      .lean()
      .exec();

    return this.unique(products.flatMap((product) => this.mediaOf(product)));
  }

  /**
   * Картинки товара живут в двух местах: media и seo.seoImage. Витрина строит
   * галерею из seoImage, поэтому обходить нужно оба поля.
   */
  private mediaOf(product: { media?: string[]; seo?: SeoDTO }): string[] {
    const seoImages = (product.seo?.seoImage ?? []).map(
      (image) => image?.imageName,
    );
    return [...(product.media ?? []), ...seoImages].filter(Boolean);
  }

  private unique(references: string[]): string[] {
    return [...new Set(references.filter(Boolean))];
  }

  private async pruneJobs() {
    const outdated = await this.jobModel
      .find({ status: { $ne: 'running' } })
      .sort({ startedAt: -1 })
      .skip(JOBS_HISTORY_LIMIT)
      .select('_id')
      .lean()
      .exec();

    if (outdated.length) {
      await this.jobModel
        .deleteMany({ _id: { $in: outdated.map((job) => job._id) } })
        .exec();
    }
  }

  private toJob(job: ImageJobEntity): ImageJob {
    const lastProgressAt = job.lastProgressAt ?? job.startedAt;

    return {
      id: job.jobId,
      status: job.status,
      total: job.total,
      processed: job.processed,
      unchanged: job.unchanged,
      skipped: job.skipped,
      failed: job.failed,
      warnings: job.warnings ?? [],
      warningsTruncated: Boolean(job.warningsTruncated),
      force: Boolean(job.force),
      currentFile: job.currentFile || undefined,
      startedAt: new Date(job.startedAt).toISOString(),
      finishedAt: job.finishedAt
        ? new Date(job.finishedAt).toISOString()
        : undefined,
      lastProgressAt: new Date(lastProgressAt).toISOString(),
      stalled:
        job.status === 'running' &&
        Date.now() - new Date(lastProgressAt).getTime() > STALL_AFTER,
      error: job.error,
    };
  }
}
