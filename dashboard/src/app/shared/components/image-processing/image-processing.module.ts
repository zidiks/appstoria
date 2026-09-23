import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { TuiButtonModule, TuiLoaderModule } from "@taiga-ui/core";
import { TuiBadgeModule, TuiProgressModule } from "@taiga-ui/kit";
import { ImageCropDialogComponent } from "./image-crop-dialog/image-crop-dialog.component";
import { ImageProcessingDialogComponent } from "./image-processing-dialog/image-processing-dialog.component";

@NgModule({
  declarations: [
    ImageCropDialogComponent,
    ImageProcessingDialogComponent,
  ],
  imports: [
    CommonModule,
    TuiButtonModule,
    TuiLoaderModule,
    TuiBadgeModule,
    TuiProgressModule,
  ],
})
export class ImageProcessingModule { }
