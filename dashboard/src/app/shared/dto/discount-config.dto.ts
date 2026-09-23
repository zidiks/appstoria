import {ApiId} from "../models/api-data.model";

export interface DiscountConfigDto {
  minCount: number;
  discount: number;
  fixPriceMinCount: number;
  fixPriceCategories: string[];
  fixPrice: number;
}

export interface UpdateDiscountConfigRequestDto extends DiscountConfigDto { }

export interface DiscountConfigResponseDto extends DiscountConfigDto, ApiId { }
