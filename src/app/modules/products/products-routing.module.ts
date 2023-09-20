import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from "./products.component";
import { ProductsListComponent } from "./products-list/products-list.component";
import { ProductsDetailsComponent } from "./products-details/products-details.component";

const routes: Routes = [
  {
    path: '', component: ProductsComponent, children: [
      {
        path: 'list',
        component: ProductsListComponent,
      },
      {
        path: 'new',
        component: ProductsDetailsComponent,
      },
      {
        path: 'details/:id',
        component: ProductsDetailsComponent,
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
export class ProductsRoutingModule { }
