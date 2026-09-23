import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MerchantImportRun,
  MerchantImportSource,
  MerchantImportSourceDocument,
} from './schema/merchant-import-source.schema';
import {
  MerchantImportPreviewDTO,
  MerchantImportSourceDTO,
} from './dto/merchant-import-source.dto';
import {
  MerchantFeedItem,
  parseMerchantFeed,
  splitProductLink,
} from './merchant-feed.parser';
import { calcImportedPrices } from './merchant-import.pricing';
import { ProductDocument } from '../product/schema/product.schema';
import { CategoryDocument } from '../category/schema/category.schema';
import { BrandDocument } from '../product/brand/schema/brand.schema';
import { StorageService } from '../storage/storage.service';

/** Как часто планировщик проверяет, не пора ли запустить импорт */
const SCHEDULER_TICK_MS = 60_000;
const FEED_TIMEOUT_MS = 120_000;
const MAX_WARNINGS = 50;
/** Сколько картинок товара забираем из фида */
const MAX_IMAGES = 10;

type RunTrigger = MerchantImportRun['trigger'];

@Injectable()
export class MerchantImportService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(MerchantImportService.name);
  private readonly running = new Set<string>();
  private timer?: NodeJS.Timeout;
  private ticking = false;

  constructor(
    @InjectModel(MerchantImportSource.name)
    private readonly sourceModel: Model<MerchantImportSourceDocument>,
    @InjectModel('Product')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel('Brand')
    private readonly brandModel: Model<BrandDocument>,
    private readonly storageService: StorageService,
  ) {}

  async onApplicationBootstrap() {
    // Процесс, который вёл импорт, умер вместе с прошлым запуском
    await this.sourceModel.updateMany(
      { 'lastRun.status': 'running' },
      {
        $set: {
          'lastRun.status': 'failed',
          'lastRun.finishedAt': new Date(),
          'lastRun.error': 'Импорт прерван перезапуском сервера',
        },
      },
    );
    this.timer = setInterval(() => this.tick(), SCHEDULER_TICK_MS);
    this.timer.unref();
  }

  onApplicationShutdown() {
    if (this.timer) clearInterval(this.timer);
  }

  async getSources() {
    const sources = await this.sourceModel.find().sort({ createdAt: 1 }).exec();
    return sources.map((source) => this.view(source));
  }

  async getSourceView(id: string) {
    return this.view(await this.getSource(id));
  }

  async createSource(dto: MerchantImportSourceDTO) {
    return this.view(await this.sourceModel.create(dto));
  }

  async updateSource(id: string, dto: MerchantImportSourceDTO) {
    const source = await this.sourceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!source) throw new NotFoundException('Источник не найден');
    return this.view(source);
  }

  /** Товары остаются в каталоге — отвязываем их, чтобы их можно было вести вручную */
  async deleteSource(id: string) {
    if (this.running.has(id)) {
      throw new ConflictException('Дождитесь окончания импорта');
    }
    const source = await this.getSource(id);
    await this.productModel.updateMany(
      { importSourceId: id },
      { $unset: { importSourceId: 1, importExternalId: 1 } },
    );
    await source.deleteOne();
    return this.view(source);
  }

  /** Проверка ссылки из админки: скачиваем фид и показываем, что из него получится */
  async preview(dto: MerchantImportPreviewDTO) {
    const feed = parseMerchantFeed(await this.fetchFeed(dto.url));
    const markup = dto.markupPercent ?? 30;
    return {
      title: feed.title,
      link: feed.link,
      total: feed.items.length,
      items: feed.items.slice(0, 10).map((item) => ({
        id: item.id,
        title: item.title,
        availability: item.availability,
        image: item.imageLinks[0],
        currency: item.currency,
        ...calcImportedPrices(item.price, markup),
        categoryHandle: splitProductLink(item.link).categoryHandle,
      })),
    };
  }

  /** Запуск из админки: отвечаем сразу, прогресс видно в lastRun источника */
  async startRun(id: string) {
    const source = await this.getSource(id);
    if (this.running.has(id)) {
      throw new ConflictException('Импорт уже идёт');
    }
    this.run(source, 'manual').catch((error) =>
      this.logger.error(`Импорт «${source.name}»: ${error?.message}`),
    );
    return this.view(source);
  }

  private async getSource(id: string) {
    const source = await this.sourceModel.findById(id).exec();
    if (!source) throw new NotFoundException('Источник не найден');
    return source;
  }

  private view(source: MerchantImportSourceDocument) {
    return { ...source.toObject(), running: this.running.has(source.id) };
  }

  private async tick() {
    if (this.ticking) return;
    this.ticking = true;
    try {
      const sources = await this.sourceModel.find({ enabled: true }).exec();
      const now = Date.now();
      for (const source of sources) {
        const last = source.lastRunAt?.getTime() ?? 0;
        const due = last + source.intervalHours * 3_600_000 <= now;
        if (due && !this.running.has(source.id)) {
          await this.run(source, 'schedule');
        }
      }
    } catch (error) {
      this.logger.error(`Планировщик импорта: ${error?.message}`);
    } finally {
      this.ticking = false;
    }
  }

  private async run(source: MerchantImportSourceDocument, trigger: RunTrigger) {
    const id = source.id as string;
    this.running.add(id);

    const stats: MerchantImportRun = {
      status: 'running',
      trigger,
      startedAt: new Date(),
      total: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      hidden: 0,
      failed: 0,
      warnings: [],
    };
    const warn = (message: string) => {
      if (stats.warnings.length < MAX_WARNINGS) stats.warnings.push(message);
    };
    const save = () =>
      this.sourceModel.updateOne({ _id: id }, { $set: { lastRun: stats } });

    try {
      // lastRunAt ставим сразу: упавший фид не должен долбиться каждую минуту
      await this.sourceModel.updateOne(
        { _id: id },
        { $set: { lastRun: stats, lastRunAt: stats.startedAt } },
      );

      const feed = parseMerchantFeed(await this.fetchFeed(source.url));
      if (!feed.items.length) {
        throw new Error('В фиде нет ни одного товара — ссылка точно на merchant.xml?');
      }
      stats.total = feed.items.length;
      await save();

      const context = await this.buildContext(source);
      const seen: string[] = [];

      for (const [index, item] of feed.items.entries()) {
        seen.push(item.id);
        try {
          const result = await this.importItem(source, item, context);
          stats[result.status]++;
          if (result.warning) warn(`${item.title || item.id}: ${result.warning}`);
        } catch (error) {
          stats.failed++;
          warn(`${item.title || item.id}: ${error?.message ?? error}`);
        }
        if (index % 20 === 19) await save();
      }

      if (source.hideMissing) {
        const res = await this.productModel.updateMany(
          {
            importSourceId: id,
            importExternalId: { $nin: seen },
            isStock: true,
          },
          { $set: { isStock: false } },
        );
        stats.hidden = res.modifiedCount;
      }

      stats.status = 'done';
    } catch (error) {
      stats.status = 'failed';
      stats.error = error?.message ?? String(error);
      this.logger.warn(`Импорт «${source.name}» упал: ${stats.error}`);
    } finally {
      stats.finishedAt = new Date();
      await save().catch(() => undefined);
      this.running.delete(id);
    }
  }

  private async fetchFeed(url: string): Promise<string> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: {
        'User-Agent': 'AppstoriaImporter/1.0',
        Accept: 'application/xml, text/xml, */*',
      },
    });
    if (!response.ok) {
      throw new Error(`Фид ответил HTTP ${response.status}`);
    }
    return response.text();
  }

  private async buildContext(source: MerchantImportSourceDocument) {
    const categories = await this.categoryModel
      .find({}, { handle: 1, productTypeId: 1 })
      .lean()
      .exec();
    const byHandle = new Map(
      categories.filter((c) => c.handle).map((c) => [c.handle, c]),
    );
    const defaultCategory = source.defaultCategoryId
      ? categories.find((c) => String(c._id) === source.defaultCategoryId)
      : undefined;

    const brands = await this.brandModel.find({}, { name: 1 }).lean().exec();
    const brandIds = new Map(
      brands.map((b) => [b.name?.trim().toLowerCase(), String(b._id)]),
    );

    return { byHandle, defaultCategory, brandIds };
  }

  private async importItem(
    source: MerchantImportSourceDocument,
    item: MerchantFeedItem,
    context: Awaited<ReturnType<MerchantImportService['buildContext']>>,
  ): Promise<{
    status: 'created' | 'updated' | 'unchanged' | 'skipped';
    warning?: string;
  }> {
    const sourceId = source.id as string;
    const prices = calcImportedPrices(item.price, source.markupPercent);
    const isStock = item.availability === 'in_stock';
    const currencyWarning =
      item.currency !== 'BYN' ? `цена в ${item.currency}, а не в BYN` : undefined;

    const existing = await this.productModel
      .findOne({ importSourceId: sourceId, importExternalId: item.id })
      .exec();

    if (existing) {
      const update: Record<string, unknown> = { ...prices, isStock };
      if (source.updateContent) {
        Object.assign(update, {
          name: item.title || existing.name,
          description: item.description || existing.description,
        });
        const media = await this.downloadImages(sourceId, item);
        if (media.length) update.media = media;
      }

      const changed = Object.entries(update).some(
        ([key, value]) =>
          JSON.stringify(existing.get(key)) !== JSON.stringify(value),
      );
      // priceUSD пересчитал бы цену по курсу поверх импортированной
      const hasUsd = existing.get('priceUSD') !== undefined;
      if (!changed && !hasUsd) {
        return { status: 'unchanged', warning: currencyWarning };
      }
      await this.productModel.updateOne(
        { _id: existing._id },
        { $set: update, $unset: { priceUSD: 1 } },
      );
      return { status: 'updated', warning: currencyWarning };
    }

    if (!source.createNew) {
      return { status: 'skipped' };
    }

    const { categoryHandle, seoUrl } = splitProductLink(item.link);
    const category =
      (source.matchCategoryByHandle && categoryHandle
        ? context.byHandle.get(categoryHandle)
        : undefined) ?? context.defaultCategory;
    if (!category) {
      return {
        status: 'skipped',
        warning: `нет категории «${categoryHandle ?? '—'}» и не задана категория по умолчанию`,
      };
    }

    const media = await this.downloadImages(sourceId, item);
    const brand = await this.resolveBrand(item.brand, context.brandIds);
    const categoryId = String(category._id);

    await this.productModel.create({
      name: item.title,
      description: item.description,
      media,
      ...prices,
      brand,
      categoryId,
      productTypeId: category.productTypeId,
      isNew: false,
      isRec: false,
      isStock,
      productProps: [],
      seo: {
        seoUrl: await this.uniqueSeoUrl(seoUrl || item.id, categoryId),
      },
      importSourceId: sourceId,
      importExternalId: item.id,
    });

    return {
      status: 'created',
      warning: currencyWarning ?? (media.length ? undefined : 'без фото'),
    };
  }

  private async downloadImages(sourceId: string, item: MerchantFeedItem) {
    const media: string[] = [];
    for (const url of item.imageLinks.slice(0, MAX_IMAGES)) {
      try {
        media.push(await this.storageService.saveRemoteImage(url, `imp-${sourceId}`));
      } catch (error) {
        this.logger.warn(`Фото ${url}: ${error?.message}`);
      }
    }
    return media;
  }

  private async resolveBrand(name: string | undefined, brandIds: Map<string, string>) {
    const key = name?.trim().toLowerCase();
    if (!key) return undefined;
    if (!brandIds.has(key)) {
      const brand = await this.brandModel.create({ name: name.trim() });
      brandIds.set(key, String(brand._id));
    }
    return brandIds.get(key);
  }

  /** Товар открывается по {category.handle}/{seoUrl} — в одной категории slug должен быть уникален */
  private async uniqueSeoUrl(base: string, categoryId: string) {
    const slug =
      base
        .toLowerCase()
        .replace(/[^a-z0-9а-яё_-]+/gi, '-')
        .replace(/^-+|-+$/g, '') || 'product';
    let candidate = slug;
    for (let i = 2; await this.productModel.exists({ categoryId, 'seo.seoUrl': candidate }); i++) {
      candidate = `${slug}-${i}`;
    }
    return candidate;
  }
}
