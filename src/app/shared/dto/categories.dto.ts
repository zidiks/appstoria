export interface AddCategoryDto {
  parent: string;
  name: string;
  handle: string;
  description?: string;
  media: string[];
  icon: string;
  productTypeId?: string;
  root?: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  icon: string;
  children?: string[];
  productTypeId?: string;
}
