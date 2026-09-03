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

export interface ImageJobCounters {
  total: number;
  processed: number;
  /** Уже обработанные раньше — это не проблема, в warnings не попадают */
  unchanged: number;
  skipped: number;
  failed: number;
}

export interface ImageJobSummary extends ImageJobCounters {
  results: StoredImageResult[];
  /** Пропущенные и упавшие файлы — их правим вручную кадрированием */
  warnings: StoredImageResult[];
}

export type ImageJobStatus = 'running' | 'done' | 'failed' | 'canceled';

/**
 * Массовая задача. results в неё не складываем: на несколько тысяч картинок это
 * мегабайты, которые админка тянула бы каждым опросом прогресса. Для разбора
 * достаточно warnings — только они требуют вмешательства.
 */
export interface ImageJob extends ImageJobCounters {
  id: string;
  status: ImageJobStatus;
  warnings: StoredImageResult[];
  /** Список warnings обрезан по лимиту — в задаче их было больше */
  warningsTruncated: boolean;
  startedAt: string;
  finishedAt?: string;
  /** Момент, когда последний файл был досчитан — по нему видно зависание */
  lastProgressAt?: string;
  /** Файл, который обрабатывается прямо сейчас */
  currentFile?: string;
  /** Прогресса нет подозрительно долго, хотя процесс жив */
  stalled: boolean;
  force: boolean;
  error?: string;
}
