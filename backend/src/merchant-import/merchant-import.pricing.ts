/**
 * Импортированная цена — это цена со скидкой (totalPrice). Цену «до скидки»
 * поднимаем на markupPercent и округляем вверх до «красивой» — на девятку:
 * 49, 139, 1349, 12999. Округление всегда вверх, так что наценка не меньше заданной.
 */
export function prettyOldPrice(salePrice: number, markupPercent: number): number {
  const raw = salePrice * (1 + markupPercent / 100);
  if (raw < 10) {
    return Math.ceil(raw);
  }
  const step = raw < 1000 ? 10 : raw < 10000 ? 50 : 100;
  return Math.ceil((raw + 1) / step) * step - 1;
}

export interface ImportedPrices {
  price: number;
  totalPrice: number;
  discount: number;
}

export function calcImportedPrices(
  salePrice: number,
  markupPercent: number,
): ImportedPrices {
  const totalPrice = Math.round(salePrice * 100) / 100;
  if (!markupPercent || markupPercent <= 0) {
    return { price: totalPrice, totalPrice, discount: 0 };
  }
  const price = prettyOldPrice(totalPrice, markupPercent);
  return {
    price,
    totalPrice,
    discount: Math.round((1 - totalPrice / price) * 100),
  };
}
