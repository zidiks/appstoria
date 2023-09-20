import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModulesComponent } from './modules.component';
import {
  TuiAlertModule,
  TuiButtonModule,
  TuiDialogModule,
  TuiHostedDropdownModule,
  TuiLinkModule,
  TuiScrollbarModule,
  TuiSvgModule
} from "@taiga-ui/core";
import { TuiAvatarModule } from "@taiga-ui/kit";
import { ModulesRoutingModule } from "./modules-routing.module";
import { TuiLetModule } from "@taiga-ui/cdk";

@NgModule({
  declarations: [
    ModulesComponent,
  ],
    imports: [
        CommonModule,
        ModulesRoutingModule,
        TuiDialogModule,
        TuiAlertModule,
        TuiSvgModule,
        TuiButtonModule,
        TuiAvatarModule,
        TuiHostedDropdownModule,
        TuiLinkModule,
        TuiScrollbarModule,
        TuiScrollbarModule,
        TuiLetModule,
    ]
})
export class ModulesModule { }
