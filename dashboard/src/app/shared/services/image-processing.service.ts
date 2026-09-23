import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from "@taiga-ui/core";
import { catchError, filter, Observable, of, switchMap } from "rxjs";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import {
  ImageProcessingDialogComponent,
  ImageProcessingDialogData
} from "../components/image-processing/image-processing-dialog/image-processing-dialog.component";
import { SubmitService } from "./submit.service";
import { ImageCropDialogComponent } from "../components/image-processing/image-crop-dialog/image-crop-dialog.component";
import { ImageJobDto, StoredImageResultDto } from "../dto/image-processing.dto";
import { ImagesService } from "./images.service";

const ALL_LABEL = 'Обработка изображений всех товаров';

@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private submitService: SubmitService,
    private imagesService: ImagesService,
  ) { }

  /** Обработка изображений одного товара. Возвращает true, если что-то изменилось */
  public processProduct(productId: string, productName?: string): Observable<boolean> {
    return this.open(
      { mode: 'product', productId },
      productName ? `Обработка изображений: ${productName}` : `Обработка изображений`,
    );
  }

  /**
   * Массовая обработка по всем товарам. Если прогон уже идёт — открываем его
   * прогресс, ничего не спрашивая: запустить второй всё равно нельзя.
   */
  public processAll(): Observable<boolean> {
    return this.imagesService.getCurrentImageJob().pipe(
      catchError(() => of(null)),
      switchMap((job: ImageJobDto | null) => job?.status === 'running'
        ? this.open({ mode: 'all', jobId: job.id }, ALL_LABEL)
        : this.confirmAndStart(job),
      ),
    );
  }

  /** Ручное кадрирование одной картинки */
  public cropImage(file: string): Observable<StoredImageResultDto | null> {
    return this.dialogService.open<StoredImageResultDto | null>(
      new PolymorpheusComponent(ImageCropDialogComponent, this.injector),
      {
        data: { file },
        label: `Кадрирование: ${file}`,
        size: 'l',
      },
    );
  }

  private confirmAndStart(previous: ImageJobDto | null): Observable<boolean> {
    return this.submitService.submitDialog('Запустить', this.confirmText(previous)).pipe(
      filter((confirmed) => !!confirmed),
      switchMap(() => this.open({ mode: 'all' }, ALL_LABEL)),
    );
  }

  /** В подтверждении сразу напоминаем, чем кончился прошлый прогон */
  private confirmText(previous: ImageJobDto | null): string {
    const base = 'Будут обработаны изображения всех товаров: кадрирование до квадрата с отступом 8px.'
      + ' Оригиналы сохраняются в резервную копию.';

    if (!previous) {
      return `${base} Продолжить?`;
    }

    const date = new Date(previous.finishedAt || previous.startedAt).toLocaleString('ru-RU');
    const outcome = previous.status === 'done' ? 'завершился' : 'прервался';
    const problems = previous.skipped + previous.failed;

    return `${base} Прошлый прогон ${outcome} ${date}: обработано ${previous.processed}`
      + `${problems ? `, требуют внимания ${problems}` : ''}. Продолжить?`;
  }

  private open(data: ImageProcessingDialogData, label: string): Observable<boolean> {
    return this.dialogService.open<boolean>(
      new PolymorpheusComponent(ImageProcessingDialogComponent, this.injector),
      {
        data,
        label,
        size: 'l',
      },
    );
  }
}
