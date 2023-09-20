export interface AddTypeDto {
  name: string;
  description: string;
  properties: string[];
}

export interface UpdateTypeDto extends AddTypeDto { }
