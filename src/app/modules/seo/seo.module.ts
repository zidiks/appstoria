import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  TuiBadgeModule,
  TuiBreadcrumbsModule,
  TuiDataListDropdownManagerModule, TuiFilesModule, TuiInputFilesModule,
  TuiInputModule, TuiInputTagModule, TuiTabsModule, TuiTextAreaModule,
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
import { ReactiveFormsModule } from "@angular/forms";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";
import { TuiEditorModule } from "@taiga-ui/addon-editor";
import { SeoComponent } from "./seo.component";
import { SeoListComponent } from "./seo-list/seo-list.component";
import { SeoDialogComponent } from "./seo-list/seo-dialog/seo-dialog.component";
import { SeoRoutingModule } from "./seo-routing.module";

@NgModule({
  declarations: [
    SeoComponent,
    SeoListComponent,
    SeoDialogComponent,
  ],
  imports: [
    CommonModule,
    SeoRoutingModule,
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
    TuiDataListDropdownManagerModule,
    DataEmptyModule,
    TuiBadgeModule,
    TuiEditorModule,
    TuiFilesModule,
    TuiInputFilesModule,
    TuiInputTagModule,
    TuiTabsModule,
    TuiTextAreaModule,
  ]
})
export class SeoModule { }
