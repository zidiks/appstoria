export interface CategoryModel {
  _id: string;
  name: string;
  handle: string;
  title?: string;
  description?: string;
  content?: string;
  keywords?: string[];
  media: string[];
  icon?: string;
  root?: boolean;
  children?: CategoryModel[];
  productTypeId?: string;
  parent?: CategoryParentModel;
  order?: number;
}

export interface CategoryParentModel {
  _id: string;
  name: string;
  handle: string;
  description?: string;
  children?: CategoryModel[];
}

export interface CategoryLinearModel {
  _id: string;
  name: string;
  handle?: string;
  productTypeId?: string;
}

export interface CategoryBaseModel {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  productTypeId?: string;
}
