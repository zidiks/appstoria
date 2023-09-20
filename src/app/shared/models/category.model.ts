export interface CategoryModel {
  _id: string;
  name: string;
  handle: string;
  description?: string;
  media: string[];
  root?: boolean;
  children?: CategoryModel[];
  productTypeId?: string;
  parent?: CategoryParentModel;
}

export interface CategoryParentModel {
  _id: string;
  name: string;
  handle: string;
  description?: string;
}

export interface CategoryLinearModel {
  _id: string;
  name: string;
  productTypeId?: string;
}

export interface CategoryBaseModel {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  productTypeId?: string;
}
