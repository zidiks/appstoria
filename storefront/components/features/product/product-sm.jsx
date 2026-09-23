import React from 'react';

import ALink from '~/components/features/custom-link';

import { toDecimal, getImgPath } from '~/utils';
import Image from "next/image";

function SmallProduct(props) {
  const { product, adClass, isReviewCount = true } = props;

  return (
    <div className={`product product-list-sm ${adClass}`}>
      <figure className="product-media">
        <ALink href={`/${product.categoryHandle ? product.categoryHandle + '/' : ''}${product.seo?.seoUrl || '#'}`}>
          <Image alt={product.seo?.seoImage[0]?.imageAlt || product.name || ''} title={product.seo?.seoTitle || product.name || ''} src={getImgPath(product.media[0])} width="100" height="100" style={{ objectFit: 'contain', padding: '0.2rem' }} />
        </ALink>
      </figure>

      <div className="product-details">
        <span className="product-name related-name">
          <ALink href={`/${product.categoryHandle ? product.categoryHandle + '/' : ''}${product.seo?.seoUrl || '#'}`}>{product.name}</ALink>
        </span>

        <div className="product-price related-price">
          {product.price !== product.totalPrice ? (
            <>
              <del className="old-price">от {toDecimal(product.price)} BYN</del>
              <ins className="new-price">от {toDecimal(product.totalPrice)} BYN</ins>
            </>
          ) : (
            <ins className="new-price">от {toDecimal(product.price)} BYN</ins>
          )}
        </div>

        <div className="brand">
          <span>{product.brand.name}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SmallProduct);
