import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogContext, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT, PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { interval, Subscription, switchMap } from "rxjs";
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
  public errorMessage = '';
  /** Что-то изменилось — вызывающему экрану нужно перечитать данные */
  private changed = false;
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
    this.runForAll();
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  public get processedCount(): number {
    return (this.job || this.summary)?.processed || 0;
  }

  public get total(): number {
    return (this.job || this.summary)?.total || 0;
  }

  public get handled(): number {
    const source = this.job || this.summary;
    return source ? source.processed + source.skipped + source.failed : 0;
  }

  public get progress(): number {
    return this.total ? Math.round((this.handled / this.total) * 100) : 0;
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
      next: (job: ImageJobDto) => {
        this.job = job;
        this.poll(job.id);
      },
      error: (err) => this.fail(err?.error?.message || 'Не удалось запустить обработку'),
    });
  }

  private poll(jobId: string): void {
    this.pollSubscription = interval(POLL_INTERVAL)
      .pipe(switchMap(() => this.imagesService.getImageJob(jobId)))
      .subscribe({
        next: (job: ImageJobDto) => {
          this.job = job;
          if (job.status !== 'running') {
            this.pollSubscription?.unsubscribe();
            if (job.status === 'failed') {
              this.fail(job.error || 'Обработка завершилась с ошибкой');
              return;
            }
            this.finish(job);
          }
        },
        error: () => this.fail('Потеряна связь с задачей обработки'),
      });
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
    this.warnings = this.warnings.filter((item) => item.file !== warning.file);
    this.changed = true;
  }
}
