import { ApiId } from "../models/api-data.model";

export interface AddPaymentMethodRequestDto {
  name: string;
  description: string;
}

export interface UpdatePaymentMethodRequestDto extends AddPaymentMethodRequestDto { }

export interface PaymentMethodResponseDto extends AddPaymentMethodRequestDto, ApiId { }
