import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsComponent } from './brands.component';
import { BrandsListComponent } from './brands-list/brands-list.component';
import { BrandsRoutingModule } from "./brands-routing.module";
import {
  TuiBreadcrumbsModule,
  TuiDataListDropdownManagerModule,
  TuiInputModule,
  TuiTextAreaModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiLinkModule, TuiLoaderModule,
  TuiSvgModule, TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { TuiLetModule } from "@taiga-ui/cdk";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { BrandDialogComponent } from './brands-list/brand-dialog/brand-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    BrandsComponent,
    BrandsListComponent,
    BrandDialogComponent,
  ],
    imports: [
        CommonModule,
        BrandsRoutingModule,
        TuiBreadcrumbsModule,
        TuiLinkModule,
        TuiButtonModule,
        TuiTableModule,
        TuiLetModule,
        ApiLoadingStateModule,
        TuiSvgModule,
        TuiTablePaginationModule,
        TuiHintModule,
        TuiDropdownModule,
        TuiDataListModule,
        TuiLoaderModule,
        TuiInputModule,
        ReactiveFormsModule,
        TuiTextfieldControllerModule,
        TuiTextAreaModule,
        TuiDataListDropdownManagerModule,
        DataEmptyModule,
    ]
})
export class BrandsModule { }
