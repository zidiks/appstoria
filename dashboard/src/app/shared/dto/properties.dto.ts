import { ProductTypePropertyType } from "../enums/product-property.enum";

export interface AddPropertyDto {
  showCard: boolean;
  showFilter: boolean;
  name: string;
  units?: string;
  description?: string;
  type: ProductTypePropertyType;
  options?: (string | number)[];
}

export interface ProductPropertyValueDto {
  productTypePropertyId: string;
  value: PropertyValue;
}

export type PropertyValue = string | string[] | number | boolean;

export interface UpdatePropertyDto extends AddPropertyDto { }
