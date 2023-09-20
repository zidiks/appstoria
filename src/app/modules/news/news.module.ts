import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsComponent } from './news.component';
import { NewsRoutingModule } from "./news-routing.module";
import { NewsListComponent } from './news-list/news-list.component';
import { NewsDetailsComponent } from './news-details/news-details.component';
import {
    TuiBreadcrumbsModule,
    TuiInputFilesModule,
    TuiInputModule,
    TuiInputTagModule,
    TuiTextAreaModule
} from "@taiga-ui/kit";
import { TuiButtonModule, TuiLinkModule, TuiLoaderModule, TuiSvgModule } from "@taiga-ui/core";
import { TuiTableModule, TuiTablePaginationModule } from "@taiga-ui/addon-table";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { TuiLetModule } from "@taiga-ui/cdk";
import { ReactiveFormsModule } from "@angular/forms";
import { TuiEditorModule } from "@taiga-ui/addon-editor";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";

@NgModule({
  declarations: [
    NewsComponent,
    NewsListComponent,
    NewsDetailsComponent
  ],
    imports: [
        CommonModule,
        NewsRoutingModule,
        TuiBreadcrumbsModule,
        TuiLinkModule,
        TuiButtonModule,
        TuiTableModule,
        ApiLoadingStateModule,
        TuiSvgModule,
        TuiTablePaginationModule,
        TuiLetModule,
        ReactiveFormsModule,
        TuiLoaderModule,
        TuiInputModule,
        TuiTextAreaModule,
        TuiInputFilesModule,
        TuiEditorModule,
        TuiInputTagModule,
        DataEmptyModule,
    ]
})
export class NewsModule { }
