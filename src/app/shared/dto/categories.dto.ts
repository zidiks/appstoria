export interface AddCategoryDto {
  parent: string;
  name: string;
  handle: string;
  title?: string;
  description?: string;
  keywords?: string[];
  media: string[];
  icon: string;
  productTypeId?: string;
  root?: boolean;
  order?: number;
}

export interface UpdateCategoryDto {
  name: string;
  handle: string;
  title?: string;
  description?: string;
  keywords?: string[];
  media: string[];
  icon: string;
  children?: string[];
  productTypeId?: string;
  order?: number;
}
