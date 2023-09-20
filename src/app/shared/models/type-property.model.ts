import { ProductTypePropertyType } from "../enums/product-property.enum";

export interface ProductTypeModel {
  _id: string;
  name: string;
  description?: string;
  properties: ProductTypePropertyModel[];
}

export interface ProductTypePrevModel {
  _id: string;
  name: string;
  description?: string;
  propertiesLength: number;
}

export interface ProductTypePropertyModel {
  _id: string;
  showCard: boolean;
  showFilter: boolean;
  name: string;
  units?: string;
  description?: string;
  type: ProductTypePropertyType;
  options?: (string | number)[];
}

export interface ProductPropertyValueModel {
  _id: string;
  name: string;
  type: ProductTypePropertyType;
  value?: string | number | boolean;
}


