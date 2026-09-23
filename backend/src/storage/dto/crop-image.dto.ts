import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CropImageDTO {
  /** Ссылка на файл в том же виде, в каком она лежит в media товара */
  @IsString()
  @IsNotEmpty()
  file: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  left: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  top: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  width: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  height: number;
}
