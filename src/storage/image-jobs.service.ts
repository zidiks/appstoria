import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
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
  ImageJobSummary,
  StoredImageResult,
} from './interfaces/image-job.interface';

/** Сколько завершённых задач держим в памяти, чтобы админка успела забрать результат */
const JOBS_HISTORY_LIMIT = 20;

@Injectable()
export class ImageJobsService {
  private readonly logger = new Logger(ImageJobsService.name);
  private readonly jobs = new Map<string, ImageJob>();
  private isRunning = false;

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    private readonly storageService: StorageService,
  ) {}

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
    if (this.isRunning) {
      throw new ConflictException('Обработка изображений уже запущена');
    }

    const references = await this.collectProductMedia();
    const job: ImageJob = {
      id: nanoid(10),
      status: 'running',
      total: references.length,
      processed: 0,
      unchanged: 0,
      skipped: 0,
      failed: 0,
      results: [],
      warnings: [],
      startedAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);
    this.pruneJobs();
    this.isRunning = true;
    void this.runJob(job, references, options);

    return job;
  }

  getJob(jobId: string): ImageJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Задача ${jobId} не найдена`);
    }
    return job;
  }

  getJobs(): ImageJob[] {
    return [...this.jobs.values()].sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    );
  }

  private async runJob(
    job: ImageJob,
    references: string[],
    options: ProcessImageOptions,
  ) {
    try {
      for (const reference of references) {
        const result = await this.processReference(reference, options);
        this.collect(job, result);
      }
      job.status = 'done';
    } catch (error) {
      job.status = 'failed';
      job.error = error?.message ?? 'Неизвестная ошибка';
      this.logger.error(`Задача ${job.id} упала: ${job.error}`);
    } finally {
      job.finishedAt = new Date().toISOString();
      this.isRunning = false;
    }
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

    if (result.status === 'processed') {
      summary.processed++;
      return;
    }

    // Уже обработанное раньше — штатная ситуация, в warnings ему не место
    if (result.status === 'unchanged') {
      summary.unchanged++;
      return;
    }

    if (result.status === 'skipped') {
      summary.skipped++;
    } else {
      summary.failed++;
    }
    summary.warnings.push(result);
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

  private pruneJobs() {
    const finished = this.getJobs().filter((job) => job.status !== 'running');
    for (const job of finished.slice(JOBS_HISTORY_LIMIT)) {
      this.jobs.delete(job.id);
    }
  }
}
