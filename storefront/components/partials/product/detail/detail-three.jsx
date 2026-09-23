import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {useRouter} from 'next/router';

import {wishlistActions} from '~/store/wishlist';
import {cartActions} from '~/store/cart';

import {getImgPath, toDecimal} from '~/utils';
import InlineSVG from "react-inlinesvg";
import {bagOutlineIcon} from "~/icons/bag-outline";
import StickyBuyFooter from "~/components/common/sticky-buy-footer";
import clsx from "clsx";

function DetailThree(props) {
  let router = useRouter();
  const { product, isSticky = false, isDesc = false, adClass = '', isSizeGuide = true, isNav = true, openModal, productName, selectedAdditionals, setSelectedAdditionals } = props;
  const { toggleWishlist, addToCart, wishlist } = props;
  const [curColor, setCurColor] = useState('null');
  const [curSize, setCurSize] = useState('null');
  const [curIndex, setCurIndex] = useState(0);
  const [cartActive, setCartActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const selectedAdditionalsIds = selectedAdditionals.map(item => item._id);

  useEffect(() => {
    setCurIndex(-1);
    resetValueHandler();
  }, [product]);

  useEffect(() => {
    setCartActive(true);

    if (!product.isStock) {
      setCartActive(false);
    }
  }, [curColor, curSize, product]);

  const toggleColorHandler = (color) => {
    if (!isDisabled(color.name, curSize)) {
      if (curColor === color.name) {
        setCurColor('null');
      } else {
        setCurColor(color.name);
      }
    }
  };

  const toggleSizeHandler = (size) => {
    if (!isDisabled(curColor, size.name)) {
      if (curSize === size.name) {
        setCurSize('null');
      } else {
        setCurSize(size.name);
      }
    }
  };

  const addToCartHandler = () => {
    if (cartActive) {
      let tmpName = product.name;
      let tmpPrice = product.totalPrice ? product.totalPrice : product.price;
      tmpName += curColor !== 'null' ? '-' + curColor : '';
      tmpName += curSize !== 'null' ? '-' + curSize : '';
      addToCart({ ...product, name: tmpName, qty: quantity, price: tmpPrice });
      if (!!selectedAdditionals?.length) {
        selectedAdditionals.forEach((item) => {
          let tmpPrice = item.totalPrice ? item.totalPrice : item.price;
          addToCart({ ...item, qty: 1, price: tmpPrice });
        })
      }
    }
  };

  const orderOneClick = () => {
    if (cartActive) {
      addToCartHandler();
      router.push('/pages/cart');
    }
  };

  const additionalClick = (product) => {
    if (selectedAdditionalsIds.includes(product._id)) {
      const foundIndex = selectedAdditionals.findIndex(item => item._id === product._id);
      if (foundIndex > -1) {
        setSelectedAdditionals(selectedAdditionals.toSpliced(foundIndex, 1))
      }
    } else {
      setSelectedAdditionals([...(selectedAdditionals || []), product]);
    }
  }

  const resetValueHandler = (e) => {
    setCurColor('null');
    setCurSize('null');
  };

  function isDisabled(color, size) {}

  function changeQty(qty) {
    setQuantity(qty);
  }

  return (
    <>
      <div className={`product-details ${isSticky ? 'sticky' : ''} ${adClass}`}>
        <h1 className="product-name">
          {productName || product.name}
        </h1>

        <div className="product-meta">
          Категория: <span className="product-brand">{product.category.name}</span>
        </div>

        <p className="product-short-desc">
          {product.description}
        </p>

        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <ins className="new-price">от {toDecimal(product.totalPrice)} BYN</ins>
              <del className="old-price">{toDecimal(product.price)} BYN</del>
            </>
          ) : (
            <>
              <ins className="new-price">от {toDecimal(product.price)} BYN</ins>
            </>
          )}
        </div>

        { !!product?.associatedProducts?.length && (
          <div className="additional-container">
            <span className="additional-container-title">Добавьте аксессуары к товару:</span>
            <div className="additional-container-content">
              {(product.associatedProducts || []).map((item, index) => {
                const isActive = selectedAdditionalsIds.includes(item._id);
                return (
                  <div
                    className={clsx('additional-container-content-item', {
                      'additional-container-content-item-active': isActive,
                    })}
                    key={index}
                    onClick={() => additionalClick(item)}
                  >
                    <img
                      className="additional-container-content-item-img"
                      src={getImgPath(item.seo?.seoImage[0]?.imageName)}
                      alt={item.seo?.seoImage[0]?.imageAlt || item.name}
                    />
                    <div className="additional-container-content-item-text">
                      <span className="additional-container-content-item-name">{item.name}</span>
                      <span className="additional-container-content-item-price">от {toDecimal(item.price)} BYN</span>
                    </div>
                    <div className={clsx('additional-container-content-item-ckeckbox', {
                      'additional-container-content-item-ckeckbox-active': isActive,
                    })}>
                      { isActive && (
                        <svg className="additional-container-content-item-ckeckbox-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M21.2287 6.60355C21.6193 6.99407 21.6193 7.62723 21.2287 8.01776L10.2559 18.9906C9.86788 19.3786 9.23962 19.3814 8.84811 18.9969L2.66257 12.9218C2.26855 12.5349 2.26284 11.9017 2.64983 11.5077L3.35054 10.7942C3.73753 10.4002 4.37067 10.3945 4.7647 10.7815L9.53613 15.4677L19.1074 5.89644C19.4979 5.50592 20.1311 5.50591 20.5216 5.89644L21.2287 6.60355Z" fill="#007945"/>
                        </svg>
                      ) }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) }

        <div className="product-form product-qty pb-0">
          <div className="product-form-group">
            {product.isStock ? (
              <>
                <button className={`btn-product btn-cart btn-cart-fast text-normal ls-normal font-weight-semi-bold ${cartActive ? '' : 'disabled'}`} onClick={addToCartHandler}>
                  <div className="btn-content" style={{gap: '1rem'}}>
                    <InlineSVG className="icon-20" src={bagOutlineIcon} />
                    <span>В корзину</span>
                  </div>
                </button>
                <button className={`btn-product btn-cart text-normal ls-normal mr-none font-weight-semi-bold ${cartActive ? '' : 'disabled'}`} onClick={() => openModal(true)}>
                  Купить сразу
                </button>
              </>
            ) : (
              <>
                <span>Под заказ</span>
                <button className={`btn-product btn-cart text-normal ls-normal font-weight-semi-bold`} onClick={() => openModal(true)}>
                  Заказать
                </button>
              </>
            )}
          </div>
        </div>
        <StickyBuyFooter
          openModal={openModal}
          product={product}
          addToCartHandler={addToCartHandler}
          cartActive={cartActive}
        />
      </div>
    </>
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
})(DetailThree);
