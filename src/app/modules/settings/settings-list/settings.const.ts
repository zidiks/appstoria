import { SettingsItemModel } from "../../../shared/models/settings.model";
import { PaymentComponent } from "../payment/payment.component";
import { DeliveryComponent } from "../delivery/delivery.component";
import { OrderStateComponent } from "../order-state/order-state.component";
import { DiscountComponent } from "../discount/discount.component";

export const settingsList: SettingsItemModel[] = [
  {
    name: 'Методы доставки',
    description: 'Управление методами доставки товаров',
    component: DeliveryComponent,
    path: 'delivery',
    icon: 'tuiIconCompanyLarge'
  },
  {
    name: 'Методы оплаты',
    description: 'Управление методами оплаты товаров',
    component: PaymentComponent,
    path: 'payment',
    icon: 'tuiIconCardsLarge'
  },
  {
    name: 'Статусы заказа',
    description: 'Настройка списка статусов заказа',
    component: OrderStateComponent,
    path: 'order-state',
    icon: 'tuiIconCommentLarge'
  },
  {
    name: 'Дисконтная программа',
    description: 'Настройка условий дисконтной программы',
    component: DiscountComponent,
    path: 'discount',
    icon: 'tuiIconSettingsLarge'
  },
];
