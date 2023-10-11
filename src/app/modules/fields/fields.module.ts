import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldsComponent } from './fields.component';
import { FieldsListComponent } from './fields-list/fields-list.component';
import { FieldsRoutingModule } from "./fields-routing.module";
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
import { FieldDialogComponent } from './fields-list/field-dialog/field-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    FieldsComponent,
    FieldsListComponent,
    FieldDialogComponent,
  ],
    imports: [
        CommonModule,
        FieldsRoutingModule,
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
export class FieldsModule { }
