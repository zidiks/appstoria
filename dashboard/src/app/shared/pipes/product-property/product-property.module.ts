import { NgModule } from '@angular/core';
import { ProductPropertyPipe } from './product-property.pipe';

@NgModule({
  declarations: [
    ProductPropertyPipe
  ],
  exports: [
    ProductPropertyPipe
  ]
})
export class ProductPropertyModule { }
