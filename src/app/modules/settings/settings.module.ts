import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsListComponent } from './settings-list/settings-list.component';
import { PaymentComponent } from './payment/payment.component';
import { OrderStateComponent } from './order-state/order-state.component';
import { DeliveryComponent } from './delivery/delivery.component';
import {
  TuiBadgeModule,
  TuiBreadcrumbsModule, TuiCheckboxLabeledModule, TuiCheckboxModule,
  TuiDataListDropdownManagerModule, TuiDataListWrapperModule,
  TuiInputModule, TuiInputNumberModule, TuiInputTagModule,
  TuiIslandModule, TuiMultiSelectModule, TuiSelectModule,
  TuiTextAreaModule, TuiTreeModule
} from "@taiga-ui/kit";
import {
    TuiButtonModule,
    TuiDataListModule,
    TuiDropdownModule, TuiFormatNumberPipeModule, TuiLabelModule,
    TuiLinkModule,
    TuiLoaderModule, TuiPrimitiveCheckboxModule,
    TuiSvgModule, TuiTextfieldControllerModule
} from "@taiga-ui/core";
import { ApiLoadingStateModule } from "../../shared/pipes/api-loading-state/api-loading-state.module";
import { DataEmptyModule } from "../../shared/components/data-empty/data-empty.module";
import { DeliveryDialogComponent } from './delivery/delivery-dialog/delivery-dialog.component';
import { PaymentDialogComponent } from './payment/payment-dialog/payment-dialog.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TuiLetModule, TuiMapperPipeModule } from "@taiga-ui/cdk";
import { OrderStateDialogComponent } from './order-state/order-state-dialog/order-state-dialog.component';
import { DiscountComponent } from './discount/discount.component';
import { DiscountDialogComponent } from './discount/discount-dialog/discount-dialog.component';
import {
  DiscountDialogFixPriceComponent
} from "./discount/discount-dialog-fix-price/discount-dialog-fix-price.component";
import { TuiCurrencyPipeModule } from "@taiga-ui/addon-commerce";

@NgModule({
  declarations: [
    SettingsComponent,
    SettingsListComponent,
    PaymentComponent,
    OrderStateComponent,
    DeliveryComponent,
    DeliveryDialogComponent,
    PaymentDialogComponent,
    OrderStateDialogComponent,
    DiscountComponent,
    DiscountDialogComponent,
    DiscountDialogFixPriceComponent,
  ],
    imports: [
        CommonModule,
        SettingsRoutingModule,
        TuiBreadcrumbsModule,
        TuiLinkModule,
        TuiIslandModule,
        TuiSvgModule,
        ApiLoadingStateModule,
        TuiLoaderModule,
        TuiButtonModule,
        DataEmptyModule,
        TuiDataListDropdownManagerModule,
        TuiDropdownModule,
        TuiDataListModule,
        ReactiveFormsModule,
        TuiInputModule,
        TuiTextAreaModule,
        TuiTextfieldControllerModule,
        TuiInputTagModule,
        TuiLabelModule,
        TuiMultiSelectModule,
        TuiLetModule,
        TuiDataListWrapperModule,
        TuiSelectModule,
        TuiBadgeModule,
        TuiInputNumberModule,
        TuiCurrencyPipeModule,
        TuiFormatNumberPipeModule,
        TuiTreeModule,
        TuiCheckboxLabeledModule,
        FormsModule,
        TuiMapperPipeModule,
        TuiCheckboxModule,
        TuiPrimitiveCheckboxModule,
    ]
})
export class SettingsModule { }
