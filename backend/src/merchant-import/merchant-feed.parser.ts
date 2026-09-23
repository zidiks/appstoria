/**
 * Разбор Google Merchant RSS, который отдаёт /merchant.xml витрины на этой же
 * платформе (storefront/pages/merchant.xml.jsx). Структура известна и плоская,
 * поэтому обходимся без XML-библиотеки. Парсер терпим к старым версиям фида:
 * там между <g:shipping> блоками бывают лишние запятые, а экранирование
 * сущностей неполное.
 */
export interface MerchantFeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLinks: string[];
  availability: string;
  /** Итоговая цена товара у источника (с учётом sale_price, если он есть) */
  price: number;
  currency: string;
  brand?: string;
}

export interface MerchantFeed {
  title?: string;
  link?: string;
  items: MerchantFeedItem[];
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decode(value: string): string {
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cdata) {
    return cdata[1].trim();
  }
  // Повторяем, пока есть что раскрывать: старый фид экранировал «&» дважды
  let current = value;
  for (let i = 0; i < 3; i++) {
    const next = current.replace(
      /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
      (match, entity: string) => {
        if (entity[0] === '#') {
          const code =
            entity[1].toLowerCase() === 'x'
              ? parseInt(entity.slice(2), 16)
              : parseInt(entity.slice(1), 10);
          return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        return ENTITIES[entity.toLowerCase()] ?? match;
      },
    );
    if (next === current) break;
    current = next;
  }
  return current.trim();
}

function escapeTag(tag: string): string {
  return tag.replace(/[:]/g, '\\:');
}

function readAll(block: string, tag: string): string[] {
  const re = new RegExp(
    `<${escapeTag(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapeTag(tag)}>`,
    'gi',
  );
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    result.push(decode(match[1]));
  }
  return result;
}

function read(block: string, ...tags: string[]): string | undefined {
  for (const tag of tags) {
    const [value] = readAll(block, tag);
    if (value) return value;
  }
  return undefined;
}

/** «1 299.00 BYN» → { amount: 1299, currency: 'BYN' } */
export function parsePrice(
  value?: string,
): { amount: number; currency: string } | undefined {
  if (!value) return undefined;
  const match = value.replace(/\s/g, '').match(/^([\d.,]+)([A-Z]{3})?$/i);
  if (!match) return undefined;
  const amount = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return { amount, currency: (match[2] || 'BYN').toUpperCase() };
}

export function parseMerchantFeed(xml: string): MerchantFeed {
  const channel = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i)?.[1] ?? xml;
  const header = channel.split(/<item[\s>]/i)[0];
  const items: MerchantFeedItem[] = [];

  const itemRe = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(channel))) {
    // У доставки свой g:price — убираем её, чтобы не спутать с ценой товара
    const block = match[1].replace(/<g:shipping[\s>][\s\S]*?<\/g:shipping>/gi, '');
    const id = read(block, 'g:id', 'id');
    const regular = parsePrice(read(block, 'g:price', 'price'));
    const sale = parsePrice(read(block, 'g:sale_price', 'sale_price'));
    const price = sale ?? regular;
    if (!id || !price) continue;

    const images = [
      ...readAll(block, 'g:image_link'),
      ...readAll(block, 'g:additional_image_link'),
    ].filter((url) => /^https?:\/\//i.test(url));

    items.push({
      id,
      title: read(block, 'g:title', 'title') ?? '',
      description: read(block, 'g:description', 'description') ?? '',
      link: read(block, 'g:link', 'link') ?? '',
      imageLinks: [...new Set(images)],
      availability: (read(block, 'g:availability') ?? 'in_stock').toLowerCase(),
      price: price.amount,
      currency: price.currency,
      brand: read(block, 'g:brand'),
    });
  }

  return {
    title: read(header, 'title'),
    link: read(header, 'link'),
    items,
  };
}

/**
 * Ссылка товара на платформе имеет вид {host}/{category.handle}/{seo.seoUrl}/
 * — вытаскиваем обе части, чтобы сопоставить категорию и сохранить slug.
 */
export function splitProductLink(
  link: string,
): { categoryHandle?: string; seoUrl?: string } {
  let pathname: string;
  try {
    pathname = new URL(link).pathname;
  } catch {
    return {};
  }
  const parts = pathname
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });
  if (!parts.length) return {};
  const seoUrl = parts.pop();
  return {
    categoryHandle: parts.length ? parts.join('/') : undefined,
    seoUrl,
  };
}
