import { Injectable } from '@angular/core';
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs";
import {
  AddDeliveryMethodRequestDto,
  DeliveryMethodResponseDto,
  UpdateDeliveryMethodRequestDto
} from "../../../shared/dto/delivery-method.dto";

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(
    private http: HttpService,
  ) { }

  public getDeliveryMethods(): Observable<DeliveryMethodResponseDto[] | null> {
    return this.http.get<DeliveryMethodResponseDto[]>('store/delivery-method');
  }

  public addDeliveryMethod(payload: AddDeliveryMethodRequestDto): Observable<DeliveryMethodResponseDto | null> {
    return this.http.post<DeliveryMethodResponseDto, AddDeliveryMethodRequestDto>('store/delivery-method', payload);
  }

  public updateDeliveryMethod(id: string, payload: UpdateDeliveryMethodRequestDto): Observable<DeliveryMethodResponseDto | null> {
    return this.http.put<DeliveryMethodResponseDto, UpdateDeliveryMethodRequestDto>('store/delivery-method', id, payload);
  }

  public deleteDeliveryMethod(id: string): Observable<DeliveryMethodResponseDto | null> {
    return this.http.delete<DeliveryMethodResponseDto>('store/delivery-method', id);
  }
}
