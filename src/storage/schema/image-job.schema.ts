import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ImageJobStatus,
  StoredImageResult,
} from '../interfaces/image-job.interface';

export type ImageJobDocument = ImageJobEntity & Document;

/**
 * Состояние массовой обработки живёт в базе, а не в памяти процесса: админка
 * должна увидеть прогресс после перезахода, а зависшую задачу — распознать
 * даже если процесс, который её запустил, уже умер.
 */
@Schema({ timestamps: true, collection: 'image_jobs' })
export class ImageJobEntity {
  @Prop({ type: String, required: true, unique: true, index: true })
  jobId: string;

  @Prop({ type: String, required: true, default: 'running' })
  status: ImageJobStatus;

  @Prop({ type: Number, default: 0 })
  total: number;

  @Prop({ type: Number, default: 0 })
  processed: number;

  @Prop({ type: Number, default: 0 })
  unchanged: number;

  @Prop({ type: Number, default: 0 })
  skipped: number;

  @Prop({ type: Number, default: 0 })
  failed: number;

  @Prop({ type: [Object], default: [] })
  warnings: StoredImageResult[];

  @Prop({ type: Boolean, default: false })
  warningsTruncated: boolean;

  @Prop({ type: Boolean, default: false })
  force: boolean;

  @Prop({ type: String })
  currentFile?: string;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date })
  finishedAt?: Date;

  /**
   * Бьётся по таймеру владеющего процесса, независимо от того, сколько считается
   * текущий файл: это признак «процесс жив», а не «есть прогресс».
   */
  @Prop({ type: Date, required: true })
  heartbeatAt: Date;

  /** Обновляется, когда очередной файл досчитан — по нему ловим зависание */
  @Prop({ type: Date, required: true })
  lastProgressAt: Date;

  /** Запрос на отмену: цикл обработки видит его на ближайшем сбросе прогресса */
  @Prop({ type: Boolean, default: false })
  cancelRequested: boolean;

  @Prop({ type: String })
  error?: string;
}

export const ImageJobSchema = SchemaFactory.createForClass(ImageJobEntity);

/** Больше одной живой задачи быть не может — гарантируем это индексом, а не флагом в памяти */
ImageJobSchema.index(
  { status: 1 },
  { unique: true, partialFilterExpression: { status: 'running' } },
);
ImageJobSchema.index({ startedAt: -1 });
