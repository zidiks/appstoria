import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypesComponent } from './types.component';
import { TypesRoutingModule } from "./types-routing.module";
import { TypesListComponent } from './types-list/types-list.component';
import {
  TuiActionModule,
  TuiBreadcrumbsModule,
  TuiDataListDropdownManagerModule, TuiDataListWrapperModule,
  TuiInputModule,
  TuiMarkerIconModule,
  TuiMultiSelectModule,
  TuiTextAreaModule
} from "@taiga-ui/kit";
import {
  TuiButtonModule, TuiDataListModule,
  TuiDropdownModule,
  TuiLinkModule,
  TuiLoaderModule, TuiSvgModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { TypesDialogComponent } from './types-list/types-dialog/types-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule } from "@taiga-ui/cdk";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    TypesComponent,
    TypesListComponent,
    TypesDialogComponent,
  ],
    imports: [
        CommonModule,
        TypesRoutingModule,
        TuiBreadcrumbsModule,
        TuiLinkModule,
        TuiButtonModule,
        ApiLoadingStateModule,
        TuiLoaderModule,
        TuiActionModule,
        TuiMarkerIconModule,
        ReactiveFormsModule,
        TuiInputModule,
        TuiTextfieldControllerModule,
        TuiTextAreaModule,
        TuiDataListDropdownManagerModule,
        TuiDropdownModule,
        TuiSvgModule,
        TuiDataListModule,
        TuiMultiSelectModule,
        TuiDataListWrapperModule,
        TuiLetModule,
        DataEmptyModule,
    ],
})
export class TypesModule { }
