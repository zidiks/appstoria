import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { RouterModule } from "@angular/router";
import { TuiButtonModule, TuiErrorModule, TuiSvgModule, TuiTextfieldControllerModule } from "@taiga-ui/core";
import { TuiFieldErrorPipeModule, TuiInputModule, TuiInputPasswordModule } from "@taiga-ui/kit";
import { ReactiveFormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: LoginComponent}]),
    TuiSvgModule,
    TuiInputModule,
    TuiErrorModule,
    TuiTextfieldControllerModule,
    TuiFieldErrorPipeModule,
    TuiInputPasswordModule,
    TuiButtonModule,
    ReactiveFormsModule,
  ]
})
export class LoginModule { }
