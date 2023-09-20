import { NgModule } from '@angular/core';
import { PaginationIndexPipe } from "./pagination-index.pipe";

@NgModule({
  declarations: [
    PaginationIndexPipe
  ],
  exports: [
    PaginationIndexPipe
  ]
})
export class PaginationIndexModule { }
