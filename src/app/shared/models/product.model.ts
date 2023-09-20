import { BrandModel } from "./brand.model";
import { BaseProductProperty } from "../enums/base-product-property.emum";
import { ApiId, ApiTimestamp } from "./api-data.model";
import { ComparisonOperator } from "../enums/mongoose-query.enum";

export interface ProductModel extends ApiId, ApiTimestamp {
  name: string;
  media: string[];
  price: number;
  totalPrice: number;
  discount: number;
  brand?: BrandModel;
  description: string;
  categoryId: string;
  productTypeId: string;
  isNew: boolean;
  isRec: boolean;
  isStock: boolean;
  productProps: ProductPropertyValueModel[];
}

export interface ProductPrevModel extends ApiId, ApiTimestamp {
  name: string;
  media: string[];
  price: number;
  totalPrice: number;
  brand?: BrandModel;
  description: string;
  categoryName: string;
  isNew: boolean;
  isRec: boolean;
  isStock: boolean;
}

export interface ProductPropertyValueModel {
  productTypePropertyId: string;
  value: string | string[] | number | boolean;
}

export interface GetProductsOptions {
  search?: string;
  sort?: {
    property: BaseProductProperty;
    direction: -1 | 1;
  };
  pagination?: {
    page: number;
    limit: number;
  }
  preview?: boolean;
  baseProperties?: GetProductsBasePropertiesDTO;
  customProperties?: GetProductsCustomPropertiesDTO;
}

export type  GetProductsComparison = Partial<Record<ComparisonOperator,  GetProductsComparisonValue>>;

export type  GetProductsComparisonValue = string | number | boolean | (string | number)[];

export type GetProductsBasePropertiesDTO = Partial<Record<BaseProductProperty,  GetProductsComparison>>;

export type GetProductsCustomPropertiesDTO = Partial<Record<string,  GetProductsComparison>>;
