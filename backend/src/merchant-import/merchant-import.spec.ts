import {
  parseMerchantFeed,
  parsePrice,
  splitProductLink,
} from './merchant-feed.parser';
import { calcImportedPrices, prettyOldPrice } from './merchant-import.pricing';

// Так выглядит фид storefront/pages/merchant.xml.jsx, включая баги старой версии:
// запятая между <g:shipping> и двойное экранирование в описании
const FEED = `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
      <channel>
        <title>Shop</title>
        <link>https://shop.by</link>
          <item>
            <g:id>64a1</g:id>
            <g:title>iPhone 15 128GB &amp;quot;Black&amp;quot;</g:title>
            <g:description>Чехол &amp;amp; стекло</g:description>
            <g:link>https://shop.by/phones/iphone/iphone-15-128/</g:link>
            <g:image_link>https://api.shop.by/storage/images/iphone.webp</g:image_link>
            <g:condition>new</g:condition>
            <g:availability>in_stock</g:availability>
                <g:shipping><g:country>BY</g:country><g:price>10 BYN</g:price></g:shipping>
              ,
                <g:shipping><g:country>BY</g:country><g:price>0 BYN</g:price></g:shipping>
            <g:price>2599 BYN</g:price>
            <g:brand>Apple</g:brand>
          </item>
          <item>
            <g:id>64a2</g:id>
            <g:title>Case</g:title>
            <g:link>https://shop.by/cases/case/</g:link>
            <g:image_link>undefined</g:image_link>
            <g:price>59.90 BYN</g:price>
            <g:sale_price>49.90 BYN</g:sale_price>
          </item>
          <item><g:id>broken</g:id><g:title>No price</g:title></item>
      </channel>
    </rss>`;

describe('parseMerchantFeed', () => {
  const feed = parseMerchantFeed(FEED);

  it('reads channel and items, skips items without price', () => {
    expect(feed.title).toBe('Shop');
    expect(feed.items.map((i) => i.id)).toEqual(['64a1', '64a2']);
  });

  it('takes the item price, not shipping price', () => {
    expect(feed.items[0].price).toBe(2599);
    expect(feed.items[0].currency).toBe('BYN');
  });

  it('prefers sale_price and drops invalid image links', () => {
    expect(feed.items[1].price).toBe(49.9);
    expect(feed.items[1].imageLinks).toEqual([]);
  });

  it('decodes double-escaped entities', () => {
    expect(feed.items[0].title).toBe('iPhone 15 128GB "Black"');
    expect(feed.items[0].description).toBe('Чехол & стекло');
  });
});

describe('parsePrice', () => {
  it.each([
    ['1 299.00 BYN', 1299],
    ['49,5 BYN', 49.5],
    ['100', 100],
  ])('%s', (input, amount) => {
    expect(parsePrice(input)?.amount).toBe(amount);
  });

  it('rejects garbage', () => {
    expect(parsePrice('undefined BYN')).toBeUndefined();
    expect(parsePrice('0 BYN')).toBeUndefined();
  });
});

describe('splitProductLink', () => {
  it('splits category handle and slug', () => {
    expect(
      splitProductLink('https://shop.by/phones/iphone/iphone-15-128/'),
    ).toEqual({ categoryHandle: 'phones/iphone', seoUrl: 'iphone-15-128' });
  });
});

describe('prettyOldPrice', () => {
  it.each([
    [100, 139],
    [98.46, 129],
    [45, 59],
    [2599, 3399],
    [999, 1299],
    [9000, 11799],
    [5, 7],
  ])('%d → %d', (price, expected) => {
    expect(prettyOldPrice(price, 30)).toBe(expected);
  });

  it('never gives less than the requested markup', () => {
    for (let price = 1; price < 20000; price += 7.3) {
      expect(prettyOldPrice(price, 30)).toBeGreaterThanOrEqual(price * 1.3);
    }
  });
});

describe('calcImportedPrices', () => {
  it('keeps feed price as totalPrice and computes discount', () => {
    expect(calcImportedPrices(2599, 30)).toEqual({
      price: 3399,
      totalPrice: 2599,
      discount: 24,
    });
  });

  it('zero markup means no discount', () => {
    expect(calcImportedPrices(100, 0)).toEqual({
      price: 100,
      totalPrice: 100,
      discount: 0,
    });
  });
});
