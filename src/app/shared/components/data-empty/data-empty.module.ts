import { NgModule } from '@angular/core';
import { DataEmptyComponent } from "./data-empty.component";
import { TuiSvgModule } from "@taiga-ui/core";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    DataEmptyComponent,
  ],
  imports: [
    CommonModule,
    TuiSvgModule
  ],
  exports: [
    DataEmptyComponent
  ]
})
export class DataEmptyModule { }
