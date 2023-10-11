import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenusComponent } from "./menus.component";
import { MenuListComponent } from "./menu-list/menu-list.component";

const routes: Routes = [
  {
    path: '', component: MenusComponent, children: [
      {
        path: 'list',
        component: MenuListComponent,
      },
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
export class MenusRoutingModule { }
