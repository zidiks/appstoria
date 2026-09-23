import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeoComponent } from "./seo.component";
import { SeoListComponent } from "./seo-list/seo-list.component";

const routes: Routes = [
  {
    path: '', component: SeoComponent, children: [
      {
        path: 'list',
        component: SeoListComponent,
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
export class SeoRoutingModule { }
