import React from 'react';
import ALink from '~/components/features/custom-link';

import { toDecimal, getImgPath } from '~/utils';

export default function CartPopup(props) {
  const { product } = props;

  return (
    <div>
      <div className="minipopup-box show" style={{ top: '0' }}>
        <p className="minipopup-title">Добавлено в корзину:</p>

        <div className="product product-purchased  product-cart mb-0">
          <figure className="product-media pure-media">
            <ALink href={`/${product.category?.handle ? product.category.handle + '/' : ''}${product.seo?.seoUrl || '#'}`}>
              <img src={getImgPath(product.media[0])} width="90" height="90" alt={product.seo?.seoImage[0]?.imageAlt || product.name || ''} title={product.seo?.seoTitle || product.name || ''} />
            </ALink>
          </figure>
          <div className="product-detail">
            <ALink href={`/${product.category?.handle ? product.category.handle + '/' : ''}${product.seo?.seoUrl || '#'}`} className="product-name">
              {product.name}
            </ALink>
            <span className="price-box">
              <span className="product-quantity">{product.qty}</span>
              <span className="product-price">{toDecimal(product.price)} BYN</span>
            </span>
          </div>
        </div>

        <div className="action-group d-flex">
          <ALink href="/pages/cart" className="btn btn-sm btn-outline btn-primary btn-rounded minipopup-card-btn">
            Корзина
          </ALink>
          <ALink href="/pages/checkout" className="btn btn-sm btn-primary btn-rounded minipopup-order-btn">
            Оформить
          </ALink>
        </div>
      </div>
    </div>
  );
}
