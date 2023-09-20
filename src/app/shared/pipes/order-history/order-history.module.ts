import { NgModule } from '@angular/core';
import { OrderHistoryPipe } from './order-history.pipe';

@NgModule({
  declarations: [
    OrderHistoryPipe
  ],
  exports: [
    OrderHistoryPipe
  ]
})
export class OrderHistoryModule { }
