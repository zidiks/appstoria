import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandsListComponent } from "./brands-list/brands-list.component";
import { BrandsComponent } from "./brands.component";

const routes: Routes = [
  {
    path: '', component: BrandsComponent, children: [
      {
        path: 'list',
        component: BrandsListComponent,
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
export class BrandsRoutingModule { }
