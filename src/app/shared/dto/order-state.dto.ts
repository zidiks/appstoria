import { ApiId } from "../models/api-data.model";
import { StateColor } from "../enums/state-colors.enum";

export interface AddOrderStateRequestDto {
  label: string;
  color: StateColor;
  description?: string;
}

export interface UpdateOrderStateRequestDto extends AddOrderStateRequestDto { }

export interface OrderStateResponseDto extends AddOrderStateRequestDto, ApiId { }
