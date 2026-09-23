import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsRoutingModule } from "./analytics-routing.module";
import { TuiBreadcrumbsModule, TuiInputDateRangeModule } from "@taiga-ui/kit";
import { TuiButtonModule, TuiLinkModule } from "@taiga-ui/core";
import { TuiAxesModule, TuiLineDaysChartModule } from "@taiga-ui/addon-charts";
import { FormsModule } from "@angular/forms";
import { VisitsComponent } from './visits/visits.component';
import { SalesComponent } from './sales/sales.component';

@NgModule({
  declarations: [
    AnalyticsComponent,
    VisitsComponent,
    SalesComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    TuiBreadcrumbsModule,
    TuiLinkModule,
    TuiButtonModule,
    TuiLineDaysChartModule,
    TuiInputDateRangeModule,
    TuiAxesModule,
    FormsModule,
  ]
})
export class AnalyticsModule { }
