import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "./shared/router-guards/auth.guard";
import { UnauthGuard } from "./shared/router-guards/unauth.guard";

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
    canActivate: [UnauthGuard],
  },
  {
    path: '',
    loadChildren: () => import('./modules/modules.module').then(m => m.ModulesModule),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
