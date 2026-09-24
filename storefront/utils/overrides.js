// Переопределения данных бэка на витрине — см. site.config.js
import { FIELDS, PRICE_MARKUP, TEXT_REPLACEMENTS } from '~/site.config';

/** Округление вверх до «девятки»: 49, 139, 1349, 12999 — не меньше заданной наценки */
export function prettyOldPrice(salePrice, percent) {
  const raw = salePrice * (1 + percent / 100);
  if (raw < 10) return Math.ceil(raw);
  const step = raw < 1000 ? 10 : raw < 10000 ? 50 : 100;
  return Math.ceil((raw + 1) / step) * step - 1;
}

function isProductLike(value) {
  return (
    typeof value.totalPrice === 'number' &&
    value.totalPrice > 0 &&
    'price' in value &&
    '_id' in value
  );
}

function markupProduct(product) {
  const price = prettyOldPrice(product.totalPrice, PRICE_MARKUP.percent);
  product.price = price;
  product.discount = Math.round((1 - product.totalPrice / price) * 100);
}

// Ссылки и имена файлов не переписываем (кроме домена самого сайта в ссылках):
// в них встречается «macplus» — в хосте API и в названиях картинок.
const PROTECTED_TOKEN =
  /(https?:\/\/[^\s"'<>()]+|[\w./-]+\.(?:webp|png|jpe?g|gif|svg|avif)\b)/gi;
const SITE_HOST = /^(https?:\/\/)(?:www\.)?macplus\.by(?=[/?#]|$)/i;

export function rebrandText(text) {
  if (typeof text !== 'string' || !text) return text;
  return text
    .split(PROTECTED_TOKEN)
    .map((part, index) => {
      if (index % 2 === 1) {
        return part.replace(SITE_HOST, '$1appstoria.by');
      }
      return TEXT_REPLACEMENTS.reduce(
        (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
        part,
      );
    })
    .join('');
}

/** Текстовые поля товаров, категорий, статей и SEO, которые видит покупатель */
const TEXT_KEYS = new Set([
  'name',
  'title',
  'description',
  'content',
  'tag',
  'keywords',
  'seoTitle',
  'seoDescription',
  'seoKeywords',
  'seoAuthor',
  'seoImageAlt',
  'imageAlt',
]);

function walk(value, visit) {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visit));
  } else if (value && typeof value === 'object') {
    visit(value);
    Object.values(value).forEach((item) => walk(item, visit));
  }
}

function rebrandObject(object) {
  for (const key of Object.keys(object)) {
    if (!TEXT_KEYS.has(key)) continue;
    const value = object[key];
    if (typeof value === 'string') {
      object[key] = rebrandText(value);
    } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      object[key] = value.map(rebrandText);
    }
  }
}

// Каталог: цены + тексты. Заказы и расчёт корзины не трогаем — там итоговые суммы.
const CATALOG_URL = /\/(store\/(products|item|product\/|autocomplete|category)|article)/;
const SEO_URL = /\/seo(\/|\?|$)/;

/** Вызывается из fetchJson для каждого ответа API */
export function transformApiPayload(url, payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const path = String(url).replace(/^https?:\/\/[^/]+/, '');
  const catalog = CATALOG_URL.test(path);
  if (!catalog && !SEO_URL.test(path)) return payload;

  walk(payload, (object) => {
    if (catalog && PRICE_MARKUP.enabled && isProductLike(object)) {
      markupProduct(object);
    }
    rebrandObject(object);
  });
  return payload;
}

/** Какие из запрошенных полей реально нужно спрашивать у бэка */
export function apiFieldCodes(codes) {
  return codes.filter((code) => FIELDS[code]?.source !== 'config');
}

export function applyFieldOverrides(codes, apiFields = {}) {
  const result = { ...apiFields };
  for (const code of codes) {
    const override = FIELDS[code];
    if (override?.source === 'config') {
      result[code] = override.value;
    } else if (override?.rebrand !== false && typeof result[code] === 'string') {
      result[code] = rebrandText(result[code]);
    }
  }
  return result;
}
