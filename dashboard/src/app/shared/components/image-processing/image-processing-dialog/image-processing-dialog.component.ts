import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogContext, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { interval, startWith, Subscription, switchMap } from "rxjs";
import { ImagesService } from "../../../services/images.service";
import {
  ImageJobDto,
  ImageJobSummaryDto,
  StoredImageResultDto
} from "../../../dto/image-processing.dto";
import { ImageCropDialogComponent } from "../image-crop-dialog/image-crop-dialog.component";

export interface ImageProcessingDialogData {
  /** product — картинки одного товара, all — массовый прогон по всем товарам */
  mode: 'product' | 'all';
  productId?: string;
  /** Подключиться к уже запущенной задаче вместо запуска новой */
  jobId?: string;
}

const POLL_INTERVAL = 1500;

@Component({
  selector: 'app-image-processing-dialog',
  templateUrl: './image-processing-dialog.component.html',
  styleUrls: ['./image-processing-dialog.component.scss'],
})
export class ImageProcessingDialogComponent implements OnInit, OnDestroy {
  public summary: ImageJobSummaryDto | null = null;
  public job: ImageJobDto | null = null;
  public warnings: StoredImageResultDto[] = [];
  public running = true;
  public canceling = false;
  public errorMessage = '';
  /** Подключились к прогону, который запустили раньше — стоит сказать об этом */
  public attached = false;
  /** Что-то изменилось — вызывающему экрану нужно перечитать данные */
  private changed = false;
  /** Файлы, которые уже поправили руками: обратно из задачи их не тянем */
  private readonly resolved = new Set<string>();
  private pollSubscription?: Subscription;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean, ImageProcessingDialogData>,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private imagesService: ImagesService,
  ) { }

  ngOnInit(): void {
    if (this.context.data.mode === 'product') {
      this.runForProduct();
      return;
    }
    if (this.context.data.jobId) {
      this.attached = true;
      this.attachTo(this.context.data.jobId);
      return;
    }
    this.runForAll();
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  public get hasResult(): boolean {
    return !!(this.job || this.summary);
  }

  /** Счётчики берём из задачи, а для одного товара — из синхронного ответа */
  public get counters(): ImageJobSummaryDto | ImageJobDto | null {
    return this.job || this.summary;
  }

  public get total(): number {
    return (this.job || this.summary)?.total || 0;
  }

  /**
   * В обработанные идут и те файлы, что были обработаны в прошлые прогоны:
   * иначе на повторном запуске прогресс стоял бы на нуле до самого конца.
   */
  public get handled(): number {
    const source = this.job || this.summary;
    return source ? source.processed + source.unchanged + source.skipped + source.failed : 0;
  }

  public get progress(): number {
    return this.total ? Math.round((this.handled / this.total) * 100) : 0;
  }

  /** Сколько идёт (или сколько шла) обработка */
  public get elapsed(): string {
    if (!this.job) {
      return '';
    }
    const finished = this.job.finishedAt ? new Date(this.job.finishedAt) : new Date();
    const seconds = Math.max(0, Math.round((finished.getTime() - new Date(this.job.startedAt).getTime()) / 1000));
    if (seconds < 60) {
      return `${seconds} с`;
    }
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} мин` : `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
  }

  public get statusLabel(): string {
    switch (this.job?.status) {
      case 'canceled':
        return `Обработка остановлена, заняла ${this.elapsed}`;
      case 'failed':
        return `Обработка прервана через ${this.elapsed}`;
      case 'done':
        return `Обработка завершена за ${this.elapsed}`;
      default:
        return '';
    }
  }

  public imageUrl(file: string): string {
    return this.imagesService.getImageUrl(file);
  }

  /** Ручное кадрирование картинки, которую автоматика не осилила */
  public crop(warning: StoredImageResultDto): void {
    this.dialogService.open<StoredImageResultDto | null>(
      new PolymorpheusComponent(ImageCropDialogComponent, this.injector),
      {
        data: { file: warning.file },
        label: `Кадрирование: ${warning.file}`,
        size: 'l',
      },
    ).subscribe((res) => {
      if (res?.status === 'processed') {
        this.resolveWarning(warning);
      }
    });
  }

  /** Обработать принудительно, не глядя на цвет фона */
  public force(warning: StoredImageResultDto): void {
    this.imagesService.processImages([warning.file], true).subscribe((res: ImageJobSummaryDto) => {
      if (res?.processed) {
        this.resolveWarning(warning);
        return;
      }
      this.alertService.open(res?.warnings?.[0]?.reason || 'Не удалось обработать изображение', {
        label: `Ошибка`,
        status: TuiNotification.Error,
        autoClose: 5000,
      }).subscribe();
    });
  }

  /** Остановить прогон: зависший или просто ненужный */
  public cancel(): void {
    if (!this.job || this.canceling) {
      return;
    }
    this.canceling = true;
    this.imagesService.cancelImageJob(this.job.id).subscribe({
      next: (job: ImageJobDto) => {
        this.canceling = false;
        this.apply(job);
      },
      error: () => {
        this.canceling = false;
        this.alertService.open('Не удалось остановить обработку', {
          label: `Ошибка`,
          status: TuiNotification.Error,
          autoClose: 5000,
        }).subscribe();
      },
    });
  }

  public close(): void {
    this.context.completeWith(this.changed);
  }

  private runForProduct(): void {
    const productId = this.context.data.productId;
    if (!productId) {
      this.fail('Не передан идентификатор товара');
      return;
    }
    this.imagesService.processProductImages(productId).subscribe({
      next: (res: ImageJobSummaryDto) => this.finish(res),
      error: () => this.fail('Не удалось обработать изображения товара'),
    });
  }

  private runForAll(): void {
    this.imagesService.processAllImages().subscribe({
      next: (job: ImageJobDto) => this.apply(job, true),
      error: (err) => {
        // Задачу успели запустить с другой вкладки — просто подключаемся к ней
        if (err?.status === 409) {
          this.attached = true;
          this.attachToCurrent();
          return;
        }
        this.fail(err?.error?.message || 'Не удалось запустить обработку');
      },
    });
  }

  private attachToCurrent(): void {
    this.imagesService.getCurrentImageJob().subscribe({
      next: (job: ImageJobDto | null) => {
        if (!job) {
          this.fail('Задача обработки не найдена');
          return;
        }
        this.apply(job, true);
      },
      error: () => this.fail('Не удалось получить состояние обработки'),
    });
  }

  private attachTo(jobId: string): void {
    this.imagesService.getImageJob(jobId).subscribe({
      next: (job: ImageJobDto) => this.apply(job, true),
      error: () => this.fail('Задача обработки не найдена'),
    });
  }

  private poll(jobId: string): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = interval(POLL_INTERVAL)
      .pipe(startWith(0), switchMap(() => this.imagesService.getImageJob(jobId)))
      .subscribe({
        next: (job: ImageJobDto) => this.apply(job),
        error: () => this.fail('Потеряна связь с задачей обработки'),
      });
  }

  /** Единая точка приёма состояния задачи: и первый ответ, и каждый опрос */
  private apply(job: ImageJobDto, initial = false): void {
    this.job = job;
    this.warnings = (job.warnings || []).filter((item) => !this.resolved.has(item.file));
    this.running = job.status === 'running';
    this.changed = this.changed || job.processed > 0;
    this.errorMessage = job.status === 'failed'
      ? (job.error || 'Обработка завершилась с ошибкой')
      : '';

    if (this.running) {
      if (initial) {
        this.poll(job.id);
      }
      return;
    }
    this.pollSubscription?.unsubscribe();
  }

  private finish(summary: ImageJobSummaryDto): void {
    this.summary = summary;
    this.warnings = [...(summary.warnings || [])];
    this.running = false;
    this.changed = this.changed || summary.processed > 0;
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.running = false;
  }

  private resolveWarning(warning: StoredImageResultDto): void {
    this.resolved.add(warning.file);
    this.warnings = this.warnings.filter((item) => item.file !== warning.file);
    this.changed = true;
  }
}
