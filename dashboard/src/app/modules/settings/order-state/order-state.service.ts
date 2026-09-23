import { Injectable } from '@angular/core';
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs";
import {
  AddOrderStateRequestDto,
  OrderStateResponseDto,
  UpdateOrderStateRequestDto
} from "../../../shared/dto/order-state.dto";

@Injectable({
  providedIn: 'root'
})
export class OrderStateService {

  constructor(
    private http: HttpService,
  ) { }

  public getOrderStates(): Observable<OrderStateResponseDto[] | null> {
    return this.http.get<OrderStateResponseDto[]>('store/order-state');
  }

  public updateOrderState(id: string, payload: UpdateOrderStateRequestDto): Observable<OrderStateResponseDto | null> {
    return this.http.put<OrderStateResponseDto, UpdateOrderStateRequestDto>('store/order-state', id, payload);
  }

  public deleteOrderState(id: string): Observable<OrderStateResponseDto | null> {
    return this.http.delete<OrderStateResponseDto>('store/order-state', id);
  }

  public addOrderState(payload: AddOrderStateRequestDto): Observable<OrderStateResponseDto | null> {
    return this.http.post<OrderStateResponseDto, AddOrderStateRequestDto>('store/order-state', payload);
  }
}
