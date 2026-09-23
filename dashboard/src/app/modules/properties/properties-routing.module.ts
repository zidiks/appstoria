import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertiesComponent } from "./properties.component";
import { PropertiesListComponent } from "./properties-list/properties-list.component";
import { PropertiesDetailsComponent } from "./properties-details/properties-details.component";

const routes: Routes = [
  {
    path: '', component: PropertiesComponent, children: [
      {
        path: 'list',
        component: PropertiesListComponent,
      },
      {
        path: 'new',
        component: PropertiesDetailsComponent,
      },
      {
        path: 'details/:id',
        component: PropertiesDetailsComponent,
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
export class PropertiesRoutingModule { }
