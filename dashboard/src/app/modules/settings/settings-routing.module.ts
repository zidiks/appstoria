import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from "./settings.component";
import { SettingsListComponent } from "./settings-list/settings-list.component";
import { settingsRoutes } from "../../shared/functions/settings-routes.func";

const routes: Routes = [
  {
    path: '', component: SettingsComponent, children: [
      {
        path: 'list',
        component: SettingsListComponent,
      },
      ...settingsRoutes(),
      {
        path: '**',
        redirectTo: 'list',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
