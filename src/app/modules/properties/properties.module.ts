import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertiesComponent } from './properties.component';
import { PropertiesRoutingModule } from "./properties-routing.module";
import { PropertiesListComponent } from './properties-list/properties-list.component';
import { PropertiesDetailsComponent } from './properties-details/properties-details.component';
import {
  TuiBadgeModule,
  TuiBreadcrumbsModule, TuiCheckboxLabeledModule, TuiDataListDropdownManagerModule,
  TuiInputModule, TuiInputTagModule,
  TuiMarkerIconModule, TuiSelectModule,
  TuiTextAreaModule
} from "@taiga-ui/kit";
import {
    TuiButtonModule, TuiDataListModule, TuiDropdownModule,
    TuiHintModule,
    TuiLinkModule, TuiLoaderModule,
    TuiSvgModule,
    TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { TuiLetModule } from "@taiga-ui/cdk";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { ProductPropertyModule } from "../../shared/pipes/product-property/product-property.module";
import { ReactiveFormsModule } from "@angular/forms";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    PropertiesComponent,
    PropertiesListComponent,
    PropertiesDetailsComponent
  ],
    imports: [
        CommonModule,
        PropertiesRoutingModule,
        TuiBreadcrumbsModule,
        TuiButtonModule,
        TuiLinkModule,
        TuiTableModule,
        TuiLetModule,
        ApiLoadingStateModule,
        TuiSvgModule,
        TuiTablePaginationModule,
        TuiMarkerIconModule,
        ProductPropertyModule,
        TuiBadgeModule,
        TuiHintModule,
        ReactiveFormsModule,
        TuiInputModule,
        TuiTextAreaModule,
        TuiSelectModule,
        TuiTextfieldControllerModule,
        TuiDataListModule,
        TuiLoaderModule,
        TuiCheckboxLabeledModule,
        TuiInputTagModule,
        TuiDropdownModule,
        TuiDataListDropdownManagerModule,
        DataEmptyModule,
    ]
})
export class PropertiesModule { }
