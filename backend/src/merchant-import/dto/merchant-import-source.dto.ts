import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class MerchantImportSourceDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  url: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsNumber()
  @Min(1)
  @Max(24 * 30)
  intervalHours: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  markupPercent: number;

  @IsOptional()
  @IsMongoId()
  defaultCategoryId?: string;

  @IsOptional()
  @IsBoolean()
  matchCategoryByHandle?: boolean;

  @IsOptional()
  @IsBoolean()
  createNew?: boolean;

  @IsOptional()
  @IsBoolean()
  updateContent?: boolean;

  @IsOptional()
  @IsBoolean()
  hideMissing?: boolean;
}

export class MerchantImportPreviewDTO {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  url: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  markupPercent?: number;
}
