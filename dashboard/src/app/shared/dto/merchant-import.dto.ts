export type MerchantImportRunStatus = 'running' | 'done' | 'failed';

export interface MerchantImportRunDto {
  status: MerchantImportRunStatus;
  trigger: 'manual' | 'schedule';
  startedAt: string;
  finishedAt?: string;
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  hidden: number;
  failed: number;
  warnings: string[];
  error?: string;
}

export interface MerchantImportSourceDto {
  name: string;
  url: string;
  enabled: boolean;
  intervalHours: number;
  markupPercent: number;
  defaultCategoryId?: string | null;
  matchCategoryByHandle: boolean;
  createNew: boolean;
  updateContent: boolean;
  hideMissing: boolean;
}

export interface MerchantImportSourceResponseDto extends MerchantImportSourceDto {
  _id: string;
  lastRunAt?: string;
  lastRun?: MerchantImportRunDto;
  /** Импорт идёт прямо сейчас */
  running: boolean;
}

export interface MerchantImportPreviewItemDto {
  id: string;
  title: string;
  availability: string;
  image?: string;
  currency: string;
  price: number;
  totalPrice: number;
  discount: number;
  categoryHandle?: string;
}

export interface MerchantImportPreviewDto {
  title?: string;
  link?: string;
  total: number;
  items: MerchantImportPreviewItemDto[];
}
