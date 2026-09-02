export type ImageProcessStatus = 'processed' | 'unchanged' | 'skipped' | 'failed';

export interface StoredImageResultDto {
  file: string;
  status: ImageProcessStatus;
  reason?: string;
  url?: string;
  bytesBefore?: number;
  bytesAfter?: number;
}

export interface ImageJobSummaryDto {
  total: number;
  processed: number;
  /** Обработанные в прошлые запуски — не требуют внимания */
  unchanged: number;
  skipped: number;
  failed: number;
  results: StoredImageResultDto[];
  warnings: StoredImageResultDto[];
}

export interface ImageJobDto extends ImageJobSummaryDto {
  id: string;
  status: 'running' | 'done' | 'failed';
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

export interface CropImageDto {
  file: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
