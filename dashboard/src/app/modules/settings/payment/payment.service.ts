import { Injectable } from '@angular/core';
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs";
import {
  AddPaymentMethodRequestDto,
  PaymentMethodResponseDto,
  UpdatePaymentMethodRequestDto
} from "../../../shared/dto/payment-method.dto";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private http: HttpService,
  ) { }

  public getPaymentMethods(): Observable<PaymentMethodResponseDto[] | null> {
    return this.http.get<PaymentMethodResponseDto[]>('store/payment-method');
  }

  public updatePaymentMethod(id: string, payload: UpdatePaymentMethodRequestDto): Observable<PaymentMethodResponseDto | null> {
    return this.http.put<PaymentMethodResponseDto, UpdatePaymentMethodRequestDto>('store/payment-method', id, payload);
  }

  public deletePaymentMethod(id: string): Observable<PaymentMethodResponseDto | null> {
    return this.http.delete<PaymentMethodResponseDto>('store/payment-method', id);
  }

  public addPaymentMethod(payload: AddPaymentMethodRequestDto): Observable<PaymentMethodResponseDto | null> {
    return this.http.post<PaymentMethodResponseDto, AddPaymentMethodRequestDto>('store/payment-method', payload);
  }
}
