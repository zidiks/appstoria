export interface MenuModel {
  _id: string;
  name: string;
  handle: string;
  description?: string;
  media: string[];
  root?: boolean;
  children?: MenuModel[];
  productTypeId?: string;
  parent?: MenuParentModel;
}

export interface MenuParentModel {
  _id: string;
  name: string;
  handle: string;
  description?: string;
}

export interface MenuLinearModel {
  _id: string;
  name: string;
  productTypeId?: string;
}

export interface MenuBaseModel {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  productTypeId?: string;
}
