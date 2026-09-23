import { Pipe, PipeTransform } from '@angular/core';
import { historyData } from "../../constants/order-history.const";
import { OrderHistory } from "../../enums/order-history.enum";
import { HistoryDataItem } from "../../models/order.model";

@Pipe({
  name: 'orderHistory'
})
export class OrderHistoryPipe implements PipeTransform {

  transform(value: any): { color: string, label: string, icons: string } {
    return this.getHistoryInfo(value);
  }

  public getHistoryInfo(value: any): HistoryDataItem {
    if (value && typeof value === 'string') {
      const historyInfo = historyData[value];
      if (historyInfo) {
        return historyInfo;
      }
      return  historyData[OrderHistory.Message];
    } else {
      return historyData[OrderHistory.Message];
    }
  }

}
