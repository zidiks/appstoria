import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { OrderResponseDto, UpdateOrderRequestDto } from "../../shared/dto/order.dto";
import { GetOrdersOptions } from "../../shared/models/order.model";
import { Paginated } from "../../shared/models/paginated.model";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private http: HttpService,
  ) { }

  public getOrders(options?: GetOrdersOptions): Observable<Paginated<OrderResponseDto> | null> {
    return this.http.post<Paginated<OrderResponseDto>, GetOrdersOptions>('store/orders', options);
  }

  public updateOrder(id: string, payload: UpdateOrderRequestDto): Observable<OrderResponseDto | null> {
    return this.http.put<OrderResponseDto, UpdateOrderRequestDto>('store/order', id, payload);
  }

  public deleteOrder(id: string): Observable<OrderResponseDto | null> {
    return this.http.delete<OrderResponseDto>('store/order', id);
  }

  public getOrderById(id: string): Observable<OrderResponseDto | null> {
    return this.http.get<OrderResponseDto>(`store/order/${id}`).pipe(
      map((order: OrderResponseDto) => {
        order.historyList = order.historyList.sort((a, b) => a.time - b.time);
        return order;
      })
    );
  }
}
