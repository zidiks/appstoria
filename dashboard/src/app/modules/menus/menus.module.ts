import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenusComponent } from './menus.component';
import { MenusRoutingModule } from "./menus-routing.module";
import { MenuListComponent } from './menu-list/menu-list.component';
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
import { MenuDialogComponent } from './menu-list/menu-dialog/menu-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule } from "@taiga-ui/cdk";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    MenusComponent,
    MenuListComponent,
    MenuDialogComponent,
  ],
    imports: [
        CommonModule,
        MenusRoutingModule,
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
export class MenusModule { }
