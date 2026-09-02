import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { IMAGE_PROCESSING } from './const/image-processing.const';

export type ImageProcessStatus =
  | 'processed'
  /** Файл уже прошёл обработку раньше — трогать его незачем */
  | 'unchanged'
  | 'skipped'
  | 'failed';

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ProcessImageOptions {
  /** Ручное кадрирование вместо автоматического поиска объекта */
  crop?: CropRect;
  /** Обработать даже если фон не распознан как белый */
  force?: boolean;
}

export interface ProcessImageResult {
  status: ImageProcessStatus;
  reason?: string;
  buffer?: Buffer;
  width?: number;
  height?: number;
}

interface RawImage {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}

@Injectable()
export class ImageProcessingService {
  /**
   * Приводит изображение к квадрату: объект по центру, вокруг белый паддинг.
   * Итог отдаётся уже в webp — теми же настройками, что и обычная загрузка.
   */
  async process(
    input: Buffer,
    options: ProcessImageOptions = {},
  ): Promise<ProcessImageResult> {
    const metadata = await this.readMetadata(input);
    if (!metadata) {
      return { status: 'failed', reason: 'Не удалось прочитать изображение' };
    }

    if (!options.crop) {
      // trim на однотонной картинке ничего не обрезает и молча возвращает её же
      if (await this.isUniform(input)) {
        return {
          status: 'skipped',
          reason: 'Изображение однотонное, объект не найден',
        };
      }

      if (!options.force) {
        const { isWhite, whiteRatio } = await this.analyzeBackground(input);
        if (!isWhite) {
          const percent = Math.round(whiteRatio * 100);
          return {
            status: 'skipped',
            reason: `Фон не белый: белых пикселей по рамке ${percent}%`,
          };
        }
      }
    }

    const object = await this.extractObject(input, metadata, options.crop);
    if (!object) {
      return {
        status: 'skipped',
        reason: 'Изображение однотонное, объект не найден',
      };
    }

    const square = await this.padToSquare(object);
    const buffer = await this.encode(square);

    return {
      status: 'processed',
      buffer,
      width: square.width,
      height: square.height,
    };
  }

  /**
   * Считает долю белых пикселей по рамке уменьшенной копии.
   * Работает по краям, потому что нас интересует именно фон, а не объект.
   */
  async analyzeBackground(
    input: Buffer,
  ): Promise<{ isWhite: boolean; whiteRatio: number }> {
    const { data, info } = await sharp(input, { failOnError: false })
      .flatten({ background: IMAGE_PROCESSING.background })
      .resize(IMAGE_PROCESSING.sampleSize, IMAGE_PROCESSING.sampleSize, {
        fit: 'inside',
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const border = Math.max(
      2,
      Math.round(Math.min(width, height) * IMAGE_PROCESSING.borderRatio),
    );
    const colorChannels = Math.min(channels, 3);

    let total = 0;
    let white = 0;

    for (let y = 0; y < height; y++) {
      const isEdgeRow = y < border || y >= height - border;
      for (let x = 0; x < width; x++) {
        const isEdgeColumn = x < border || x >= width - border;
        if (!isEdgeRow && !isEdgeColumn) {
          continue;
        }

        total++;
        const offset = (y * width + x) * channels;
        let isWhitePixel = true;
        for (let channel = 0; channel < colorChannels; channel++) {
          if (data[offset + channel] < IMAGE_PROCESSING.whiteChannelMin) {
            isWhitePixel = false;
            break;
          }
        }
        if (isWhitePixel) {
          white++;
        }
      }
    }

    const whiteRatio = total ? white / total : 0;
    return {
      isWhite: whiteRatio >= IMAGE_PROCESSING.whiteBorderRatio,
      whiteRatio,
    };
  }

  private async isUniform(input: Buffer): Promise<boolean> {
    try {
      const { channels } = await sharp(input, { failOnError: false }).stats();
      return channels.every(
        (channel) => channel.stdev < IMAGE_PROCESSING.uniformStdevMax,
      );
    } catch {
      return false;
    }
  }

  private async readMetadata(input: Buffer): Promise<sharp.Metadata | null> {
    try {
      const metadata = await sharp(input, { failOnError: false }).metadata();
      return metadata.width && metadata.height ? metadata : null;
    } catch {
      return null;
    }
  }

  /**
   * Обрезает картинку до границ объекта: по заданному прямоугольнику,
   * либо автоматически по отличию от фона.
   */
  private async extractObject(
    input: Buffer,
    metadata: sharp.Metadata,
    crop?: CropRect,
  ): Promise<RawImage | null> {
    let pipeline = sharp(input, { failOnError: false }).flatten({
      background: IMAGE_PROCESSING.background,
    });

    pipeline = crop
      ? pipeline.extract(this.clampRect(crop, metadata))
      : pipeline.trim(IMAGE_PROCESSING.trimThreshold);

    try {
      return await this.toRaw(pipeline);
    } catch (error) {
      if (crop) {
        throw error;
      }
      // trim падает, если на картинке нет ничего кроме фона
      return null;
    }
  }

  private async padToSquare(image: RawImage): Promise<RawImage> {
    const side =
      Math.max(image.width, image.height) + IMAGE_PROCESSING.padding * 2;
    const extraX = side - image.width;
    const extraY = side - image.height;
    const left = Math.floor(extraX / 2);
    const top = Math.floor(extraY / 2);

    return this.toRaw(
      this.fromRaw(image).extend({
        left,
        right: extraX - left,
        top,
        bottom: extraY - top,
        background: IMAGE_PROCESSING.background,
      }),
    );
  }

  private async encode(image: RawImage): Promise<Buffer> {
    let pipeline = this.fromRaw(image);

    if (image.width > IMAGE_PROCESSING.maxSide) {
      pipeline = pipeline.resize(
        IMAGE_PROCESSING.maxSide,
        IMAGE_PROCESSING.maxSide,
        { fit: 'inside', withoutEnlargement: true },
      );
    }

    return pipeline.webp(IMAGE_PROCESSING.webp).toBuffer();
  }

  /**
   * Каждый шаг пайплайна выполняем отдельным инстансом sharp: внутри одного
   * инстанса операции применяются в своём фиксированном порядке, а нам важно,
   * чтобы паддинг считался именно от обрезанного объекта.
   */
  private fromRaw(image: RawImage): sharp.Sharp {
    return sharp(image.data, {
      raw: {
        width: image.width,
        height: image.height,
        channels: image.channels as 1 | 2 | 3 | 4,
      },
    });
  }

  private async toRaw(pipeline: sharp.Sharp): Promise<RawImage> {
    const { data, info } = await pipeline
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return {
      data,
      width: info.width,
      height: info.height,
      channels: info.channels,
    };
  }

  private clampRect(crop: CropRect, metadata: sharp.Metadata): CropRect {
    const left = Math.max(
      0,
      Math.min(Math.round(crop.left), metadata.width - 1),
    );
    const top = Math.max(
      0,
      Math.min(Math.round(crop.top), metadata.height - 1),
    );

    return {
      left,
      top,
      width: Math.max(
        1,
        Math.min(Math.round(crop.width), metadata.width - left),
      ),
      height: Math.max(
        1,
        Math.min(Math.round(crop.height), metadata.height - top),
      ),
    };
  }
}
