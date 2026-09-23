import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { TuiAlertService, TuiDialogContext, TuiNotification } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { ImagesService } from "../../../services/images.service";
import { CropImageDto, StoredImageResultDto } from "../../../dto/image-processing.dto";

interface Selection {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Минимальная сторона выделения в пикселях экрана — чтобы случайный клик не отправлял кроп */
const MIN_SELECTION = 8;

@Component({
  selector: 'app-image-crop-dialog',
  templateUrl: './image-crop-dialog.component.html',
  styleUrls: ['./image-crop-dialog.component.scss'],
})
export class ImageCropDialogComponent {
  @ViewChild('image') public imageRef?: ElementRef<HTMLImageElement>;

  public readonly src: string;
  public loading = false;
  public selection: Selection | null = null;
  private start: { x: number; y: number } | null = null;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<StoredImageResultDto | null, { file: string }>,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private imagesService: ImagesService,
  ) {
    this.src = `${this.imagesService.getImageUrl(this.context.data.file)}?v=${Date.now()}`;
  }

  public get file(): string {
    return this.context.data.file;
  }

  public onPointerDown(event: PointerEvent): void {
    const rect = this.imageRect;
    if (!rect || this.loading) {
      return;
    }
    event.preventDefault();
    this.start = {
      x: this.clamp(event.clientX - rect.left, rect.width),
      y: this.clamp(event.clientY - rect.top, rect.height),
    };
    this.selection = { left: this.start.x, top: this.start.y, width: 0, height: 0 };
    (event.target as Element).setPointerCapture?.(event.pointerId);
  }

  public onPointerMove(event: PointerEvent): void {
    const rect = this.imageRect;
    if (!this.start || !rect) {
      return;
    }
    const x = this.clamp(event.clientX - rect.left, rect.width);
    const y = this.clamp(event.clientY - rect.top, rect.height);
    this.selection = {
      left: Math.min(x, this.start.x),
      top: Math.min(y, this.start.y),
      width: Math.abs(x - this.start.x),
      height: Math.abs(y - this.start.y),
    };
  }

  public onPointerUp(): void {
    this.start = null;
    if (this.selection && (this.selection.width < MIN_SELECTION || this.selection.height < MIN_SELECTION)) {
      this.selection = null;
    }
  }

  public reset(): void {
    this.selection = null;
    this.start = null;
  }

  public apply(): void {
    const image = this.imageRef?.nativeElement;
    const rect = this.imageRect;
    if (!image || !rect || !this.selection) {
      return;
    }

    // Выделение живёт в координатах экрана, а бэку нужны координаты оригинала
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    const payload: CropImageDto = {
      file: this.file,
      left: Math.round(this.selection.left * scaleX),
      top: Math.round(this.selection.top * scaleY),
      width: Math.max(1, Math.round(this.selection.width * scaleX)),
      height: Math.max(1, Math.round(this.selection.height * scaleY)),
    };

    this.loading = true;
    this.imagesService.cropImage(payload).subscribe({
      next: (res: StoredImageResultDto) => {
        this.loading = false;
        if (res?.status === 'processed') {
          this.alertService.open(`Изображение ${this.file} обработано`, {
            label: `Готово`,
            status: TuiNotification.Success,
            autoClose: 3000,
          }).subscribe();
          this.context.completeWith(res);
          return;
        }
        this.alertService.open(res?.reason || 'Не удалось обработать изображение', {
          label: `Ошибка`,
          status: TuiNotification.Error,
          autoClose: 5000,
        }).subscribe();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  public cancel(): void {
    this.context.completeWith(null);
  }

  private get imageRect(): DOMRect | null {
    return this.imageRef?.nativeElement.getBoundingClientRect() ?? null;
  }

  private clamp(value: number, max: number): number {
    return Math.max(0, Math.min(value, max));
  }
}
