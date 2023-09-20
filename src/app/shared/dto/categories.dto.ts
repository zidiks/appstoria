export interface AddCategoryDto {
  parent: string;
  name: string;
  handle: string;
  description?: string;
  media: string[];
  productTypeId?: string;
  root?: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  children?: string[];
  productTypeId?: string;
}
