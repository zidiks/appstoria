import { StateColor } from "../enums/state-colors.enum";
import { ProductModel, ProductPrevModel } from "../models/product.model";
import { OrderHistory } from "../enums/order-history.enum";
import { ApiId, ApiTimestamp } from "../models/api-data.model";

export interface AddOrderRequestDto {
  customer: OrderCustomerDto;
  state: OrderStateDto;
  delivery: OrderDeliveryDto;
  paymentMethod: OrderPaymentMethodDto;
  cartItems: OrderCartItemDto[];
  subTotalPrice: number;
  totalPrice: number;
  totalDiscount: number;
  historyList: OrderHistoryItemDto[];
}

export interface UpdateOrderRequestDto extends AddOrderRequestDto { }

export interface OrderResponseDto extends AddOrderRequestDto, ApiId, ApiTimestamp {
  orderCode: string;
}

export interface OrderCartItemDto {
  product: ProductModel;
  count: number;
}

export interface OrderCustomerDto {
  phone: string;
  name: string;
}

export interface OrderStateDto {
  label: string;
  color: StateColor;
  description?: string;
}

export interface OrderPaymentMethodDto {
  name: string;
  description: string;
}

export interface OrderDeliveryDto {
  deliveryMethod: OrderDeliveryMethodDto;
  deliveryAddress: string;
  deliveryData: OrderDeliveryDataValueDto[];
  comment: string;
}

export interface OrderDeliveryMethodDto {
  name: string;
  description: string;
}

export interface OrderDeliveryDataValueDto {
  name: string;
  value: string;
}

export interface OrderHistoryItemDto {
  type: OrderHistory,
  details?: string;
  time: number;
  products?: ProductPrevModel[];
}
