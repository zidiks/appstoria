import { Injectable } from '@nestjs/common';
import { StorageResponse } from './dto/storage.response';
import { path } from 'app-root-path';
import {
  copy,
  ensureDir,
  opendir,
  pathExists,
  readdir,
  readFile,
  remove,
  stat,
  writeFile,
} from 'fs-extra';
import { MFile } from './helpers/mfile.class';
import * as sharp from 'sharp';
import { DeleteDTO } from './dto/delete.dto';
import { resolve, parse, join, relative, dirname, isAbsolute } from 'path';
import { createHash } from 'crypto';
import {
  ImageProcessingService,
  ProcessImageOptions,
} from './image-processing.service';
import { StoredImageResult } from './interfaces/image-job.interface';
import { IMAGE_PROCESSING } from './const/image-processing.const';

const STORAGE_FOLDER = 'storage';
/** В media товара лежит голое имя файла — искать его нужно здесь */
const IMAGES_FOLDER = 'images';
/**
 * Оригиналы лежат вне storage: их не должно быть ни в раздаче, ни в списке файлов
 * админки. В докере путь нужно вынести на отдельный том через STORAGE_ORIGINALS_DIR,
 * иначе бэкапы пропадут при следующем редеплое.
 */
const ORIGINALS_FOLDER = 'storage_originals';
/**
 * Обработанный файл сохраняется под новым именем с хешем содержимого: витрина
 * ходит через next/image с годовым кешем, и по старому URL показывала бы старую
 * картинку. Одинаковый результат даёт одинаковый хеш, так что лишних файлов нет.
 */
const PROCESSED_MARKER = 'sq';
const PROCESSED_NAME_PATTERN = /\.sq-[0-9a-f]{8}$/i;

export interface UploadOptions {
  /** Кропнуть до квадрата с паддингом перед конвертацией в webp */
  process?: boolean;
  force?: boolean;
}

@Injectable()
export class StorageService {
  private readonly storageRoot = resolve(`${path}/${STORAGE_FOLDER}`);
  private readonly originalsRoot = resolve(
    process.env.STORAGE_ORIGINALS_DIR || `${path}/${ORIGINALS_FOLDER}`,
  );

  constructor(private readonly imageProcessing: ImageProcessingService) {}

  async saveFiles(files: MFile[]): Promise<StorageResponse[]> {
    const uploadFolder = `${path}/storage/images`;
    await ensureDir(uploadFolder);
    const res: StorageResponse[] = [];

    for (const file of files) {
      const fileName = file.originalname;
      await writeFile(`${uploadFolder}/${fileName}`, file.buffer);
      res.push({
        url: `storage/images/${fileName}`,
        name: fileName,
        shortName: parse(file.originalname).name,
      });
    }
    return res;
  }

  async convertToWebP(file: Buffer): Promise<Buffer> {
    return sharp(file).webp(IMAGE_PROCESSING.webp).toBuffer();
  }

  async convertAndSave(files: MFile[], options: UploadOptions = {}) {
    const convertBucket: MFile[] = [];
    const warnings: (string | undefined)[] = [];

    for (const file of files) {
      let buffer: Buffer | undefined;
      let warning: string | undefined;

      if (options.process) {
        const result = await this.imageProcessing.process(file.buffer, {
          force: options.force,
        });
        if (result.status === 'processed') {
          buffer = result.buffer;
        } else {
          // Загрузку не роняем: кладём картинку как есть, а причину отдаём админке
          warning = result.reason;
        }
      }

      convertBucket.push({
        originalname: `${parse(file.originalname).name}.webp`,
        buffer: buffer ?? (await this.convertToWebP(file.buffer)),
      });
      warnings.push(warning);
    }

    const saved = await this.saveFiles(convertBucket);
    return saved.map((item, index) => ({
      ...item,
      processed: Boolean(options.process) && !warnings[index],
      warning: warnings[index],
    }));
  }

  /**
   * Обрабатывает файл, который уже лежит в storage: оригинал уезжает в бэкап,
   * результат перезаписывает файл на месте.
   */
  async processStoredImage(
    reference: string,
    options: ProcessImageOptions = {},
  ): Promise<StoredImageResult> {
    const relativePath = this.toRelativePath(reference);
    if (!relativePath) {
      return {
        file: reference,
        status: 'failed',
        reason: 'Некорректный путь к файлу',
      };
    }

    // Перекодирование lossy webp каждый раз меняет байты, поэтому повторно
    // обработанные файлы не трогаем: иначе каждый прогон плодил бы копии
    // и терял качество. Принудительно — через force или ручной кроп.
    if (!options.crop && !options.force && this.isProcessedName(relativePath)) {
      return {
        file: reference,
        status: 'unchanged',
        reason: 'Изображение уже обработано',
      };
    }

    const absolutePath = join(this.storageRoot, relativePath);
    if (!(await pathExists(absolutePath))) {
      return { file: reference, status: 'failed', reason: 'Файл не найден' };
    }

    const input = await readFile(absolutePath);

    let result;
    try {
      result = await this.imageProcessing.process(input, options);
    } catch (error) {
      return {
        file: reference,
        status: 'failed',
        reason: error?.message ?? 'Ошибка обработки изображения',
      };
    }

    if (result.status !== 'processed' || !result.buffer) {
      return { file: reference, status: result.status, reason: result.reason };
    }

    await this.backupOriginal(relativePath, absolutePath);

    const targetPath = this.toProcessedPath(relativePath, result.buffer);
    await writeFile(join(this.storageRoot, targetPath), result.buffer);

    return {
      file: reference,
      status: 'processed',
      url: this.toPublicReference(reference, relativePath, targetPath),
      bytesBefore: input.length,
      bytesAfter: result.buffer.length,
    };
  }

  async getStorage() {
    const PATH = `${path}/storage/`;
    return await this.getFiles(PATH);
  }

  async getFiles(dir) {
    const subFolders = await readdir(dir);
    const files = [];
    await Promise.all(
      subFolders.map(async (subFolder) => {
        const res = resolve(dir, subFolder);
        files.push(res);
        return (await stat(res)).isDirectory() ? this.getFiles(res) : res;
      }),
    );
    return files;
  }

  async deleteFile(deleteDTO: DeleteDTO) {
    await remove(`${path}/storage/${deleteDTO.folder}/${deleteDTO.name}`);
    const isEmptyDir = await opendir(`${path}/storage/${deleteDTO.folder}/`);
  }

  /**
   * Приводит ссылку из media (абсолютный url, /storage/images/x.webp, images/x.webp)
   * к пути относительно storage и не выпускает за его пределы.
   */
  private toRelativePath(reference: string): string | null {
    if (!reference) {
      return null;
    }

    let value = reference.trim();
    if (/^https?:\/\//i.test(value)) {
      try {
        value = decodeURIComponent(new URL(value).pathname);
      } catch {
        return null;
      }
    }

    value = value.split('?')[0].split('#')[0];
    value = value.replace(/\\/g, '/').replace(/^\/+/, '');
    if (value.startsWith(`${STORAGE_FOLDER}/`)) {
      value = value.slice(STORAGE_FOLDER.length + 1);
    }
    if (!value) {
      return null;
    }
    if (!value.includes('/')) {
      value = `${IMAGES_FOLDER}/${value}`;
    }

    const absolutePath = resolve(this.storageRoot, value);
    const relativePath = relative(this.storageRoot, absolutePath);
    if (
      !relativePath ||
      relativePath.startsWith('..') ||
      isAbsolute(relativePath)
    ) {
      return null;
    }

    return relativePath.replace(/\\/g, '/');
  }

  private isProcessedName(relativePath: string): boolean {
    return PROCESSED_NAME_PATTERN.test(parse(relativePath).name);
  }

  /** Имя результата: исходное имя + хеш содержимого, всегда .webp */
  private toProcessedPath(relativePath: string, buffer: Buffer): string {
    const parsed = parse(relativePath);
    // Повторная обработка не должна плодить цепочки вида name.sq-a.sq-b
    const base = parsed.name.replace(PROCESSED_NAME_PATTERN, '');
    const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 8);
    const name = `${base}.${PROCESSED_MARKER}-${hash}.webp`;

    return parsed.dir ? `${parsed.dir}/${name}` : name;
  }

  /**
   * Отдаём ссылку в том же виде, в каком она пришла: в media товара лежит голое
   * имя файла, и подменять его на полный путь нельзя.
   */
  private toPublicReference(
    reference: string,
    relativePath: string,
    targetPath: string,
  ): string {
    if (relativePath === targetPath) {
      return reference;
    }

    const from = parse(relativePath).base;
    const to = parse(targetPath).base;
    const index = reference.lastIndexOf(from);

    return index === -1
      ? reference
      : reference.slice(0, index) + to + reference.slice(index + from.length);
  }

  /** Оригинал сохраняем только один раз — до самой первой обработки файла */
  private async backupOriginal(relativePath: string, absolutePath: string) {
    // Промежуточные результаты обработки бэкапить не нужно: у них уже есть оригинал
    if (this.isProcessedName(relativePath)) {
      return;
    }

    const backupPath = join(this.originalsRoot, relativePath);
    if (await pathExists(backupPath)) {
      return;
    }
    await ensureDir(dirname(backupPath));
    await copy(absolutePath, backupPath);
  }
}
