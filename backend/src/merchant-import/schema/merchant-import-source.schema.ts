import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MerchantImportRunStatus = 'running' | 'done' | 'failed';

export class MerchantImportRun {
  status: MerchantImportRunStatus;
  trigger: 'manual' | 'schedule';
  startedAt: Date;
  finishedAt?: Date;
  /** Товаров в фиде */
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  /** Пропали из фида — сняты с наличия */
  hidden: number;
  failed: number;
  warnings: string[];
  error?: string;
}

export type MerchantImportSourceDocument = MerchantImportSource & Document;

@Schema({ timestamps: true, collection: 'merchant_import_sources' })
export class MerchantImportSource {
  @Prop({ type: String, required: true })
  name: string;

  /** Полная ссылка на фид, например https://example.by/merchant.xml */
  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @Prop({ type: Number, default: 12 })
  intervalHours: number;

  /** На сколько процентов цена «до скидки» выше цены из фида */
  @Prop({ type: Number, default: 30 })
  markupPercent: number;

  /** Категория для новых товаров, если не нашлась категория с тем же handle */
  @Prop({ type: String })
  defaultCategoryId?: string;

  @Prop({ type: Boolean, default: true })
  matchCategoryByHandle: boolean;

  @Prop({ type: Boolean, default: true })
  createNew: boolean;

  /** Обновлять у существующих товаров название, описание и фото (иначе только цену и наличие) */
  @Prop({ type: Boolean, default: false })
  updateContent: boolean;

  /** Снимать с наличия товары, которые пропали из фида */
  @Prop({ type: Boolean, default: true })
  hideMissing: boolean;

  @Prop({ type: Date })
  lastRunAt?: Date;

  @Prop({ type: Object })
  lastRun?: MerchantImportRun;
}

export const MerchantImportSourceSchema =
  SchemaFactory.createForClass(MerchantImportSource);
