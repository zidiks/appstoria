import { Component, OnInit } from '@angular/core';
import { TuiDay, TuiDayLike, TuiDayRange } from "@taiga-ui/cdk";

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Аналитика`,
      routerLink: `/analytics`,
    },
  ];

  range = new TuiDayRange(
    TuiDay.currentLocal(),
    TuiDay.currentLocal().append({year: 1}),
  );

  readonly maxLength: TuiDayLike = {month: 12};

  constructor() { }

  ngOnInit(): void {
  }

}
