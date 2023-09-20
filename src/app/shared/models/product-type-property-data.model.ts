import { ProductTypePropertyType } from "../enums/product-property.enum";

export interface ProductTypePropertyDataModel {
  name: string;
  description: string;
  options?: boolean;
}

export interface ProductTypePropertyItemModel {
  key: ProductTypePropertyType;
  name: string;
  description: string;
}

