import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories.component';
import { CategoriesRoutingModule } from "./categories-routing.module";
import { CategoryListComponent } from './category-list/category-list.component';
import {
  TuiBreadcrumbsModule,
  TuiDataListDropdownManagerModule,
  TuiInputModule, TuiInputTagModule, TuiSelectModule,
  TuiTextAreaModule,
  TuiTreeModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule,
  TuiDataListModule, TuiDialogModule,
  TuiDropdownModule,
  TuiLinkModule,
  TuiLoaderModule, TuiPrimitiveTextfieldModule,
  TuiSvgModule, TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { CategoryDialogComponent } from './category-list/category-dialog/category-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule } from "@taiga-ui/cdk";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";
import { CategoryReorderComponent } from './category-list/category-reorder/category-reorder.component';
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    CategoriesComponent,
    CategoryListComponent,
    CategoryDialogComponent,
    CategoryReorderComponent,
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    TuiBreadcrumbsModule,
    TuiButtonModule,
    TuiLinkModule,
    ApiLoadingStateModule,
    TuiTreeModule,
    TuiSvgModule,
    TuiLoaderModule,
    TuiDataListModule,
    TuiDataListDropdownManagerModule,
    TuiDropdownModule,
    TuiDialogModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTextAreaModule,
    TuiSelectModule,
    TuiLetModule,
    DataEmptyModule,
    TuiPrimitiveTextfieldModule,
    DragDropModule,
    TuiInputTagModule,
  ]
})
export class CategoriesModule { }
