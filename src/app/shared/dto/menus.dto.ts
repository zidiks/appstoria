export interface AddMenuDto {
  parent: string;
  name: string;
  handle: string;
  description?: string;
  media: string[];
  code: string;
  root?: boolean;
}

export interface UpdateMenuDto {
  name: string;
  handle: string;
  description?: string;
  media: string[];
  children?: string[];
  code: string;
}
