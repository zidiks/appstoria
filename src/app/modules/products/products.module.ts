import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from "./products-routing.module";
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductsDetailsComponent } from './products-details/products-details.component';
import {
  TuiAvatarModule,
  TuiBadgeModule,
  TuiBreadcrumbsModule, TuiCheckboxBlockModule, TuiCheckboxModule, TuiFieldErrorPipeModule, TuiInputFilesModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiInputTagModule,
  TuiSelectModule,
  TuiTabsModule,
  TuiTextAreaModule,
  TuiTreeModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule, TuiDataListModule, TuiErrorModule,
  TuiFormatNumberPipeModule,
  TuiHintModule,
  TuiLinkModule,
  TuiLoaderModule, TuiPrimitiveTextfieldModule,
  TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { TuiLetModule } from "@taiga-ui/cdk";
import { TuiCurrencyPipeModule } from "@taiga-ui/addon-commerce";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PropertyInputModule } from "../../shared/components/property-input/property-input.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TuiPreviewModule } from '@taiga-ui/addon-preview';
import { ErrorImgModule } from "../../shared/directives/error-img/error-img.module";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";
import { PaginationIndexModule } from "../../shared/pipes/pagination-index/pagination-index.module";
import { TuiEditorModule } from "@taiga-ui/addon-editor";
import { ProductsListAdditionalComponent } from "./products-list-additional/products-list-additional.component";

@NgModule({
  declarations: [
    ProductsComponent,
    ProductsListComponent,
    ProductsListAdditionalComponent,
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
    TuiInputTagModule,
    TuiPrimitiveTextfieldModule,
    FormsModule,
    TuiCheckboxModule,
    TuiEditorModule,
    TuiTabsModule,
  ]
})
export class ProductsModule { }
