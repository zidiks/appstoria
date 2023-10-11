import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FieldsListComponent } from "./fields-list/fields-list.component";
import { FieldsComponent } from "./fields.component";

const routes: Routes = [
  {
    path: '', component: FieldsComponent, children: [
      {
        path: 'list',
        component: FieldsListComponent,
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
export class FieldsRoutingModule { }
