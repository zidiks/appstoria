import { OrderHistory } from "../enums/order-history.enum";
import { BaseOrderPropertyEnum } from "../enums/base-order-property.enum";

export interface HistoryDataItem {
  type: OrderHistory;
  color: string;
  label: string;
  icons: string;
}

export interface HistoryDataItemWithCode {
  code: string;
  color: string;
  label: string;
  icons: string;
}

export interface GetOrdersOptions {
  sort?: {
    property: BaseOrderPropertyEnum;
    direction: -1 | 1;
  };
  pagination?: {
    page: number;
    limit: number;
  }
}
