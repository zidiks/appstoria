import { Component, OnInit } from '@angular/core';
import { settingsList } from "./settings.const";

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss']
})
export class SettingsListComponent implements OnInit {
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Настройки`,
      routerLink: `/settings`,
    },
  ];

  public settings = settingsList;

  constructor() { }

  ngOnInit(): void {
  }

}
