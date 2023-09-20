import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from "./products-routing.module";
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsDetailsComponent } from './products-details/products-details.component';
import {
    TuiAvatarModule,
    TuiBadgeModule,
    TuiBreadcrumbsModule, TuiCheckboxBlockModule, TuiFieldErrorPipeModule, TuiInputFilesModule,
    TuiInputModule,
    TuiInputNumberModule,
    TuiSelectModule,
    TuiTextAreaModule, TuiTreeModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule, TuiDataListModule, TuiErrorModule,
  TuiFormatNumberPipeModule,
  TuiHintModule,
  TuiLinkModule,
  TuiLoaderModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { TuiLetModule } from "@taiga-ui/cdk";
import { TuiCurrencyPipeModule } from "@taiga-ui/addon-commerce";
import { ReactiveFormsModule } from "@angular/forms";
import { PropertyInputModule } from "../../shared/components/property-input/property-input.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TuiPreviewModule } from '@taiga-ui/addon-preview';
import { ErrorImgModule } from "../../shared/directives/error-img/error-img.module";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";
import { PaginationIndexModule } from "../../shared/pipes/pagination-index/pagination-index.module";

@NgModule({
  declarations: [
    ProductsComponent,
    ProductsListComponent,
    ProductsDetailsComponent
  ],
    imports: [
        CommonModule,
        ProductsRoutingModule,
        TuiBreadcrumbsModule,
        TuiLinkModule,
        TuiButtonModule,
        TuiTableModule,
        ApiLoadingStateModule,
        TuiSvgModule,
        TuiTablePaginationModule,
        TuiLetModule,
        TuiFormatNumberPipeModule,
        TuiCurrencyPipeModule,
        ReactiveFormsModule,
        TuiInputModule,
        TuiLoaderModule,
        TuiSelectModule,
        TuiTextfieldControllerModule,
        TuiDataListModule,
        TuiHintModule,
        TuiTextAreaModule,
        TuiInputNumberModule,
        TuiTreeModule,
        TuiInputFilesModule,
        TuiErrorModule,
        TuiFieldErrorPipeModule,
        PropertyInputModule,
        DragDropModule,
        TuiBadgeModule,
        TuiPreviewModule,
        ErrorImgModule,
        DataEmptyModule,
        PaginationIndexModule,
        TuiAvatarModule,
        TuiCheckboxBlockModule,
    ]
})
export class ProductsModule { }
