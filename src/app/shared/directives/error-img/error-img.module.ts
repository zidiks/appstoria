import { NgModule } from '@angular/core';
import { ErrorImgDirective } from "./error-img.directive";

@NgModule({
  declarations: [
    ErrorImgDirective,
  ],
  exports: [
    ErrorImgDirective,
  ]
})
export class ErrorImgModule { }
