import React, {useEffect, useRef, useState} from 'react';
import InlineSVG from "react-inlinesvg";
import {bagOutlineIcon} from "~/icons/bag-outline";
import {toDecimal} from "~/utils";

export default function StickyBuyFooter({product, openModal, addToCartHandler, cartActive}) {
  const footerRef = useRef(null);
  const scrollPos = useRef(0);
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;
      const scrollingDown = currentY > scrollPos.current;
      scrollPos.current = currentY;

      const contentEl = document.querySelector('.page-content');
      const headerEl = document.querySelector('header');
      const contentTop = contentEl?.offsetTop ?? 0;
      const headerHeight = headerEl?.offsetHeight ?? 0;

      if (window.innerWidth < 768) {
        if (currentY >= contentTop + headerHeight + 500 && scrollingDown) {
          setSticky(true);
        } else {
          setSticky(false);
        }
      } else {
        setSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const footerStyle = footerRef.current
    ? { marginBottom: isSticky ? `70px` : `-${footerRef.current.offsetHeight}px` }
    : {};

  return (
    <div
      ref={footerRef}
      className={`sticky-footer sticky-content fix-bottom sticky-buy-footer fixed`}
      style={footerStyle}
    >
      <div>
        <div>
          <span>Стоимость:</span>
        </div>
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
        <div className="product-form pb-0">
          <div className="product-form-group">
            {product.isStock ? (
              <>
                <button className={`btn-product btn-cart btn-cart-fast text-normal ls-normal font-weight-semi-bold ${cartActive ? '' : 'disabled'}`} onClick={addToCartHandler}>
                  <div className="btn-content" style={{gap: '1rem'}}>
                    <InlineSVG className="icon-20" src={bagOutlineIcon} />
                    <span>В корзину</span>
                  </div>
                </button>
                <button className={`btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${cartActive ? '' : 'disabled'}`} onClick={() => openModal(true)}>
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
      </div>
    </div>
  );
}
