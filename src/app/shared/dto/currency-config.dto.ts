import {ApiId} from "../models/api-data.model";

export interface CurrencyConfigDto {
  currency: number;
}

export interface UpdateCurrencyConfigRequestDto extends CurrencyConfigDto { }

export interface CurrencyConfigResponseDto extends CurrencyConfigDto, ApiId { }
