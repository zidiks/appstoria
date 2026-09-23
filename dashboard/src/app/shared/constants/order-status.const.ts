import { TuiStatus } from "@taiga-ui/kit";
import { OrderStatus } from "../enums/order-status.enum";

export const statusData: Record<string, { color: TuiStatus, label: string }> = {
  [OrderStatus.Pending]: {
    color: 'neutral',
    label: 'Ожидание',
  },
  [OrderStatus.Delivery]: {
    color: 'warning',
    label: 'Доставка',
  },
  [OrderStatus.Paid]: {
    color: 'success',
    label: 'Оплачено',
  },
  [OrderStatus.Draft]: {
    color: 'error',
    label: 'Возврат'
  },
  [OrderStatus.Draft]: {
    color: 'error',
    label: 'Возврат'
  },
  [OrderStatus.Unknown]: {
    color: 'neutral',
    label: 'Неизвестно'
  }
}
