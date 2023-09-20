export interface AddBrandDto {
  name: string;
  description: string;
  origin: string;
}

export interface UpdateBrandDto extends AddBrandDto { }
