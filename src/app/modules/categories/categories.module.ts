import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories.component';
import { CategoriesRoutingModule } from "./categories-routing.module";
import { CategoryListComponent } from './category-list/category-list.component';
import {
    TuiBreadcrumbsModule,
    TuiDataListDropdownManagerModule,
    TuiInputModule, TuiSelectModule,
    TuiTextAreaModule,
    TuiTreeModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule,
  TuiDataListModule, TuiDialogModule,
  TuiDropdownModule,
  TuiLinkModule,
  TuiLoaderModule,
  TuiSvgModule, TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { CategoryDialogComponent } from './category-list/category-dialog/category-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule } from "@taiga-ui/cdk";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    CategoriesComponent,
    CategoryListComponent,
    CategoryDialogComponent,
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
    ]
})
export class CategoriesModule { }
