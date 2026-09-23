import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsComponent } from "./news.component";
import { NewsListComponent } from "./news-list/news-list.component";
import { NewsDetailsComponent } from "./news-details/news-details.component";

const routes: Routes = [
  {
    path: '', component: NewsComponent, children: [
      {
        path: 'list',
        component: NewsListComponent,
      },
      {
        path: 'new',
        component: NewsDetailsComponent,
      },
      {
        path: 'details/:id',
        component: NewsDetailsComponent,
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
export class NewsRoutingModule { }
