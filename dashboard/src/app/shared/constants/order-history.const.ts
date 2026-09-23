import { OrderHistory } from "../enums/order-history.enum";
import { HistoryDataItem } from "../models/order.model";

export const historyData: Record<string, HistoryDataItem> = {
  [OrderHistory.Pending]: {
    type: OrderHistory.Pending,
    color: 'tui-neutral-fill',
    label: 'Ожидание',
    icons: 'tuiIconTime',
  },
  [OrderHistory.OrderStart]: {
    type: OrderHistory.OrderStart,
    color: 'tui-success-fill',
    label: 'Заказ принят',
    icons: 'tuiIconCheck',
  },
  [OrderHistory.OrderDone]: {
    type: OrderHistory.OrderDone,
    color: 'tui-success-fill',
    label: 'Заказ выполнен',
    icons: 'tuiIconDone',
  },
  [OrderHistory.Refund]: {
    type: OrderHistory.Refund,
    color: 'tui-error-fill',
    label: 'Возврат',
    icons: 'tuiIconUndo',
  },
  [OrderHistory.ShippingStart]: {
    type: OrderHistory.ShippingStart,
    color: 'tui-info-fill',
    label: 'Отправлено',
    icons: 'tuiIconPin',
  },
  [OrderHistory.ShippingDone]: {
    type: OrderHistory.ShippingDone,
    color: 'tui-success-fill',
    label: 'Доставлено',
    icons: 'tuiIconPin',
  },
  [OrderHistory.Paid]: {
    type: OrderHistory.Paid,
    color: 'tui-success-fill',
    label: 'Оплачено',
    icons: 'tuiIconCard',
  },
  [OrderHistory.Message]: {
    type: OrderHistory.Message,
    color: 'tui-info-fill',
    label: 'Информация',
    icons: 'tuiIconMail',
  },
}
