import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import ALink from '~/components/features/custom-link';
import Quantity from '~/components/features/quantity';
import { cartActions } from '~/store/cart';
import {toDecimal, getImgPath, useDebounce, pushToDataLayer} from '~/utils';
import { getCalculation } from '~/utils/endpoints/calculate';
import Head from 'next/head';
import Image from "next/image";
import InlineSVG from "react-inlinesvg";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import clsx from "clsx";
import {closeOutlineIcon} from "~/icons/close-outline";

function Cart(props) {
  const { cartList, removeFromCart, updateCart } = props;
  const [cartItems, setCartItems] = useState([]);
  const debouncedCartItems = useDebounce(cartList, 400);
  const [discount, setDiscount] = useState(0);
  const [subTotalPrice, setSubtotalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setCartItems([...cartList]);
    if (cartItems.length) {
      const products = cartItems.map((item) => ({ productId: item._id, count: item.qty }));
      getCalculation(products).then((res) => {
        setDiscount(res?.totalDiscount || 0);
        setSubtotalPrice(res?.orderPrice || 0);
        setTotalPrice(res?.totalPrice || 0);
      });
    }
  }, [debouncedCartItems]);

  useEffect(() => {
    if (!!cartList?.length) {
      const items = (cartList || []).map((item) => ({
        item_name: item.name || '',
        item_id: item._id,
        price: item.price || 0,
        item_brand: item.brand?.name || '',
        item_category: item.category?.name || '',
        quantity: 1
      }));
      const ymItems = (cartList || []).map((item) => ({
        id: item._id,
        name: item.name || '',
        price: item.price || 0,
        brand: item.brand?.name || '',
        category: item.category?.name || '',
        quantity: 1
      }));

      pushToDataLayer({
        event: 'view_cart',
        ecommerce: {
          items,
          currencyCode: "BYN",
          view: {
            products: ymItems
          }
        },
      });
    }
  }, []);

  const onChangeQty = (name, qty) => {
    const newCartItems = cartItems.map((item) => {
      return item.name === name ? { ...item, qty: qty } : item;
    });
    updateCart(newCartItems);
    setCartItems(newCartItems);
  };

  return (
    <div className="main cart border-no">
      <Head>
        <title>Mac Plus | Корзина</title>
      </Head>

      <h1 className="d-none">Mac Plus - Корзина</h1>

      <div className="page-content pt-7 pb-10">
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step active">
            <ALink href="#">1. Корзина</ALink>
            <InlineSVG className="step-by-icon" src={chevronForwardOutlineIcon} />
          </h3>
          <h3 className="title title-simple title-step">
            <ALink href="/pages/checkout">2. Оформление</ALink>
            <InlineSVG className="step-by-icon" src={chevronForwardOutlineIcon} />
          </h3>
          <h3 className="title title-simple title-step">3. Подтверждение</h3>
        </div>

        <div className="container mt-7 mb-2">
          <div className="row">
            {cartItems.length > 0 ? (
              <>
                <div className="col-lg-8 col-md-12 pr-lg-4">
                  <table className="shop-table cart-table">
                    <thead>
                      <tr>
                        <th>
                          <span>Товар</span>
                        </th>
                        <th></th>
                        <th>
                          <span>Цена</span>
                        </th>
                        <th>
                          <span>Количество</span>
                        </th>
                        <th>Стоимость</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={'cart' + item.name}>
                          <td className="product-thumbnail">
                            <figure>
                              <ALink href={`/${item.category.handle ? item.category.handle + '/' : ''}${item.seo?.seoUrl || '#'}`}>
                                <Image alt={item.seo?.seoImage[0]?.imageAlt || item.name} title={item.seo?.seoTitle || item.name} src={getImgPath(item.media[0])} width="100" height="100" />
                              </ALink>
                            </figure>
                          </td>
                          <td className="product-name">
                            <div className="product-name-section">
                              <ALink href={`/${item.category.handle ? item.category.handle + '/' : ''}${item.seo?.seoUrl || '#'}`}>{item.name}</ALink>
                            </div>
                          </td>
                          <td className="product-subtotal">
                            <span className="amount">{toDecimal(item.totalPrice)} BYN</span>
                          </td>
                          <td className="product-quantity">
                            <Quantity qty={item.qty} max={1000} onChangeQty={(qty) => onChangeQty(item.name, qty)} />
                          </td>
                          <td className="product-price">
                            <span className="amount">{toDecimal(item.totalPrice * item.qty)} BYN</span>
                          </td>
                          <td className="product-close">
                            <ALink href="#" className="product-remove" title="Remove this product" onClick={() => removeFromCart(item)}>
                              <InlineSVG className="icon-16" src={closeOutlineIcon} />
                            </ALink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <aside className="col-lg-4 sticky-sidebar-wrapper">
                  <div className="sticky-sidebar" data-sticky-options="{'bottom': 20}">
                    <div className="summary mb-4">
                      <table className="shipping">
                        <tbody>
                          <tr className={clsx({
                            'summary-subtotal': !discount
                          })}>
                            <td>
                              <h4 className="summary-subtitle">Сумма</h4>
                            </td>
                            <td>
                              <p className="summary-subtotal-price">{toDecimal(subTotalPrice)} BYN</p>
                            </td>
                          </tr>
                          { !!discount && (
                            <tr className="summary-subtotal">
                              <td>
                                <h4 className="summary-subtitle">Скидка</h4>
                              </td>
                              <td>
                                <p className="summary-subtotal-price">{toDecimal(discount)} BYN</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <table className="total">
                        <tbody>
                        <tr className="summary-subtotal">
                          <td>
                            <h4 className="summary-subtitle">Всего</h4>
                          </td>
                          <td>
                              <p className="summary-total-price ls-s">{toDecimal(totalPrice)} BYN</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <ALink href="/pages/checkout" className="btn btn-dark btn-rounded btn-checkout">
                        Оформить заказ
                      </ALink>
                    </div>
                  </div>
                </aside>
              </>
            ) : (
              <div className="empty-cart text-center">
                <p>Ваша корзина сейчас пуста.</p>
                <i className="cart-empty d-icon-bag"></i>
                <p className="return-to-shop mb-0">
                  <ALink className="button wc-backward btn btn-dark btn-md" href="/shop">
                    В каталог
                  </ALink>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    cartList: state.cart.data ? state.cart.data : [],
  };
}

export default connect(mapStateToProps, { removeFromCart: cartActions.removeFromCart, updateCart: cartActions.updateCart })(Cart);
