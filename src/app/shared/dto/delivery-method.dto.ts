import { PaymentMethodResponseDto } from "./payment-method.dto";
import { ApiId, ApiTimestamp } from "../models/api-data.model";

export interface AddDeliveryMethodRequestDto {
  name: string;
  description: string;
  fields: DeliveryMethodFieldDto;
  paymentMethods: string[];
}

export interface UpdateDeliveryMethodRequestDto extends AddDeliveryMethodRequestDto { }

export interface DeliveryMethodFieldDto {
  code: string;
  name: string;
}

export interface DeliveryMethodResponseDto extends ApiId, ApiTimestamp {
  name: string;
  description: string;
  fields: DeliveryMethodFieldDto[];
  paymentMethods: PaymentMethodResponseDto[];
}
