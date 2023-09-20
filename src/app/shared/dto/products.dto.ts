import { ProductPropertyValueDto } from "./properties.dto";
import { ApiId } from "../models/api-data.model";

export interface AddProductDto {
  name: string;
  media: string[];
  price: number;
  totalPrice: number;
  discount: number;
  brand: string;
  description: string;
  categoryId: string;
  productTypeId: string;
  isNew: boolean;
  isRec: boolean;
  isStock: boolean;
  productProps: ProductPropertyValueDto[];
}

export interface UpdateProductDto extends AddProductDto { }

export interface Autocomplete extends ApiId {
  name: string;
  media?: string;
}
