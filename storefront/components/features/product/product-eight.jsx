import React from 'react';
import { connect } from 'react-redux';

import ALink from '~/components/features/custom-link';

import { cartActions } from '~/store/cart';
import { modalActions } from '~/store/modal';
import { wishlistActions } from '~/store/wishlist';

import { getImgPath, toDecimal } from '~/utils';
import Image from "next/image";

function ProductEight(props) {
  const { product, adClass, addToCart } = props;

  return (
    <div itemProp="itemListElement" itemScope itemType="https://schema.org/Offer" className={`product product-list ${adClass}`}>
      <figure className="product-media">
        <ALink href={`/${product.categoryHandle ? product.categoryHandle + '/' : ''}${product.seo?.seoUrl || '#'}`}>
          <div style={{padding: '1rem', aspectRatio: 'square'}}>
            <Image
              itemProp="image"
              alt={product.seo?.seoImage[0]?.imageAlt || product.name || ''}
              title={product.seo?.seoTitle || product.name || ''}
              src={getImgPath(product.seo?.seoImage[0]?.imageName)}
              width="300"
              height="338"
              style={{ objectFit: 'contain', height: '100%', objectPosition: 'center' }}
            />
          </div>
        </ALink>

        <div className="product-label-group">
          {product.isNew ? <label className="product-label label-new">Новинка</label> : ''}
          {product.isRec ? <label className="product-label label-top">Хит</label> : ''}
          {product.discount > 0 ? <label className="product-label label-sale">-{product.discount}%</label> : ''}
        </div>
      </figure>

      <div className="product-details">
        <span itemProp="name" className="product-name">
          <ALink itemProp="url" href={`/${product.categoryHandle ? product.categoryHandle + '/' : ''}${product.seo?.seoUrl || '#'}`}>
            {product.name}
          </ALink>
        </span>

        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <meta itemProp="price" content={product.totalPrice} />
              <ins className="new-price">от {toDecimal(product.totalPrice)} BYN</ins>
              <del className="old-price">{toDecimal(product.price)} BYN</del>
            </>
          ) : (
            <>
              <meta itemProp="price" content={product.price} />
              <ins className="new-price">от {toDecimal(product.price)} BYN</ins>
            </>
          )}
          <meta itemProp="priceCurrency" content="BYN" />
        </div>

        <p className="product-short-desc" style={{ marginBottom: '.5rem' }}>
          Бренд: {product.brand.name}
        </p>

        <p itemProp="description" className="product-short-desc">
          {product.description}
        </p>

        <div className="product-action">
          <ALink href={`/${product.categoryHandle ? product.categoryHandle + '/' : ''}${product.seo?.seoUrl || '#'}`} className="btn-product btn-cart" title="Go to product">
            <span>Подробнее</span>
          </ALink>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    wishlist: state.wishlist.data ? state.wishlist.data : [],
  };
}

export default connect(mapStateToProps, {
  toggleWishlist: wishlistActions.toggleWishlist,
  addToCart: cartActions.addToCart,
  ...modalActions,
})(ProductEight);
