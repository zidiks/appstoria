import { ImageProcessStatus } from '../image-processing.service';

export interface StoredImageResult {
  /** Ссылка на файл в том виде, в каком она пришла (как в media товара) */
  file: string;
  status: ImageProcessStatus;
  reason?: string;
  /** Новый url — заполняется, если файл сменил расширение на .webp */
  url?: string;
  bytesBefore?: number;
  bytesAfter?: number;
}

export interface ImageJobSummary {
  total: number;
  processed: number;
  /** Уже обработанные раньше — это не проблема, в warnings не попадают */
  unchanged: number;
  skipped: number;
  failed: number;
  results: StoredImageResult[];
  /** Пропущенные и упавшие файлы — их правим вручную кадрированием */
  warnings: StoredImageResult[];
}

export type ImageJobStatus = 'running' | 'done' | 'failed';

export interface ImageJob extends ImageJobSummary {
  id: string;
  status: ImageJobStatus;
  startedAt: string;
  finishedAt?: string;
  error?: string;
}
