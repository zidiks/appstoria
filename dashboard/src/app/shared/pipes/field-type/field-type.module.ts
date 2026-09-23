import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldTypePipe } from './field-type.pipe';

@NgModule({
  declarations: [
    FieldTypePipe
  ],
  exports: [
    FieldTypePipe
  ],
  imports: [
    CommonModule
  ]
})
export class FieldTypeModule { }
