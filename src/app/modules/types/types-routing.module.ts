import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TypesComponent } from "./types.component";
import { TypesListComponent } from "./types-list/types-list.component";

const routes: Routes = [
  {
    path: '', component: TypesComponent, children: [
      {
        path: 'list',
        component: TypesListComponent,
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
export class TypesRoutingModule { }
