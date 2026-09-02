import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from "@taiga-ui/core";
import { filter, Observable, switchMap } from "rxjs";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import {
  ImageProcessingDialogComponent,
  ImageProcessingDialogData
} from "../components/image-processing/image-processing-dialog/image-processing-dialog.component";
import { SubmitService } from "./submit.service";
import { ImageCropDialogComponent } from "../components/image-processing/image-crop-dialog/image-crop-dialog.component";
import { StoredImageResultDto } from "../dto/image-processing.dto";

@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    private submitService: SubmitService,
  ) { }

  /** Обработка изображений одного товара. Возвращает true, если что-то изменилось */
  public processProduct(productId: string, productName?: string): Observable<boolean> {
    return this.open(
      { mode: 'product', productId },
      productName ? `Обработка изображений: ${productName}` : `Обработка изображений`,
    );
  }

  /** Массовая обработка по всем товарам — с подтверждением, потому что это надолго */
  public processAll(): Observable<boolean> {
    return this.submitService.submitDialog(
      'Запустить',
      'Будут обработаны изображения всех товаров: кадрирование до квадрата с отступом 8px. Оригиналы сохраняются в резервную копию. Продолжить?',
    ).pipe(
      filter((confirmed) => !!confirmed),
      switchMap(() => this.open({ mode: 'all' }, `Обработка изображений всех товаров`)),
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
