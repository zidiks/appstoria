import { HistoryDataItem } from "../models/order.model";
import { historyData } from "../constants/order-history.const";

export function historyDataItems(): HistoryDataItem[] {
  return Object.values(historyData);
}
