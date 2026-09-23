import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ProcessOptionsDTO {
  /** Обработать даже те изображения, у которых фон не распознан как белый */
  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class ProcessFilesDTO extends ProcessOptionsDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  files: string[];
}
