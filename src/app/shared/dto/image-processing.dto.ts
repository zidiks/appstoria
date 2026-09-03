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

export type ImageJobStatus = 'running' | 'done' | 'failed' | 'canceled';

/** Массовая задача. results в неё не входят — админке нужны только warnings */
export interface ImageJobDto {
  id: string;
  status: ImageJobStatus;
  total: number;
  processed: number;
  unchanged: number;
  skipped: number;
  failed: number;
  warnings: StoredImageResultDto[];
  /** Проблемных файлов было больше, чем поместилось в отчёт */
  warningsTruncated: boolean;
  startedAt: string;
  finishedAt?: string;
  lastProgressAt?: string;
  /** Файл, который обрабатывается прямо сейчас */
  currentFile?: string;
  /** Процесс жив, но прогресса давно нет — похоже на зависание */
  stalled: boolean;
  force: boolean;
  error?: string;
}

export interface CropImageDto {
  file: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
