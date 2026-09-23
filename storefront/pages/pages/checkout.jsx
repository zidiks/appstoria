'use client'

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/router';
import {connect} from 'react-redux';
import {Collapse} from 'react-bootstrap';
import ALink from '~/components/features/custom-link';
import {pushToDataLayer, toDecimal} from '~/utils';
import {addOrder, getDeliveryMethods} from '~/utils/endpoints/orders';
import {getCalculation} from "~/utils/endpoints/calculate";
import {cartActions} from "~/store/cart";
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input';
import ru from '~/public/labels/ru';
import Head from "next/head";
import TurnstileWidget from '~/components/features/turnstile';
import {getPublicFormErrorMessage} from '~/utils/endpoints/public-form';
import FormStatus from '~/components/features/form-status';

Checkout.getInitialProps = async (context) => {
  const delivery = await getDeliveryMethods();
  return { delivery };
}

function CheckoutButton({ pending, terms, phoneValid, captchaReady }) {
  const disabled = pending || !terms || !phoneValid || !captchaReady;
  return (
    <button
      type="submit"
      className="btn btn-dark btn-rounded btn-order checkout-button"
      disabled={disabled}
    >
      Оформить заказ
    </button>
  );
}

function Checkout(props) {
  const { cartList, delivery, updateCart } = props;
  const [currentRadio, setCurrentRadio] = useState(0);
  const [payment, setPayment] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [subTotalPrice, setSubtotalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [isTerms, setIsTerms] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [phoneValue, setPhoneValue] = useState('+375');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const turnstileEnabled = Boolean(process.env.TURNSTILE_SITE_KEY);
  const phoneValid = Boolean(phoneValue && isValidPhoneNumber(phoneValue));
  const captchaReady = !turnstileEnabled || Boolean(turnstileToken);

  const router = useRouter();

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

      pushToDataLayer({
        event: 'begin_checkout',
        ecommerce: {
          items,
        },
      });
    }
  }, []);

  const orderObj = {
    customer: {

    },
    delivery: {
      deliveryData: [],
    },
  }

  useEffect(() => {
    const products = cartList.map(item => ({ productId: item._id, count: item.qty }));
    getCalculation(products, delivery[currentRadio]._id).then(res => {
      setDiscount(res?.totalDiscount || 0);
      setSubtotalPrice(res?.orderPrice || 0);
      setTotalPrice(res?.totalPrice || 0);
      setDeliveryPrice(res?.deliveryPrice || 0);
    });
  }, [currentRadio]);

  const radioHandler = (index) => {
    if (delivery[currentRadio].paymentMethods[1] && payment !== 0) {
      setPayment(0);
    }
    setCurrentRadio(index);
  }

  const submitHandler = (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!phoneValid || !captchaReady) {
      setOrderError(
        !phoneValid
          ? 'Введите корректный номер телефона.'
          : 'Дождитесь загрузки и завершите проверку безопасности.',
      );
      return;
    }

    const form = e.target;
    const formData = Object.values(form).reduce((obj, field) => { obj[field.name] = field.value; return obj }, {});
    fillOrderObj(formData);
    sendOrderObj();
  }

  const fillOrderObj = (obj) => {
    orderObj.customer.phone = phoneValue;
    orderObj.customer.name = obj.name.trim();
    orderObj.customer.surname = '';
    orderObj.delivery.deliveryMethod = { ...delivery[currentRadio] };
    orderObj.delivery.deliveryMethod.paymentMethods = delivery[currentRadio].paymentMethods.map(method => method._id);
    orderObj.delivery.deliveryData = [...delivery[currentRadio].fields.map(field => ({ name: field, value: obj[field] }))]
    orderObj.paymentMethod = delivery[currentRadio].paymentMethods[payment];
    orderObj.cartItems = cartList.map(el => ({ productId: el._id, count: el.qty }));
    orderObj.turnstileToken = turnstileToken;
    if (obj.comment) {
      orderObj.delivery.comment = obj.comment.trim();
    }
    if (obj.email) {
      orderObj.customer.email = obj.email.trim();
    }
  }

  const sendOrderObj = async () => {
    setIsPending(true);
    setOrderError('');
    try {
      const res = await addOrder(orderObj);
      if (res.error) {
        throw new Error(res.error)
      }

      try {
        const order = res
        if (!!order.cartItems?.length) {
          const items = (order.cartItems || []).map((cartItem) => {
            const item = cartItem.product;
            return {
              item_name: item.name || '',
              item_id: item._id,
              price: item.price || 0,
              item_brand: item.brand?.name || '',
              quantity: 1
            }
          });
          const ymItems = (order.cartItems || []).map((cartItem) => {
            const item = cartItem.product;
            return {
              id: item._id,
              name: item.name || '',
              price: item.price || 0,
              brand: item.brand?.name || '',
              quantity: 1
            }
          });

          pushToDataLayer({
            event: 'purchase',
            ecommerce: {
              items,
              transaction_id: order.orderCode,
              value: order.totalPrice || 0,
              currency: 'BYN',
              affiliation: 'cart',
              tax: 0,
              shipping: order.delivery.deliveryMethod.deliveryPrice || 0,
              currencyCode: "BYN",
              purchase: {
                actionField: {
                  id: order.orderCode,
                  revenue: order.totalPrice || 0,
                  tax: 0,
                  shipping: order.delivery.deliveryMethod.deliveryPrice || 0,
                },
                products: ymItems
              }
            },
          });
        }
      } catch (e) {
        console.log(e)
      }

      router.push(`/pages/order/${res.orderCode}`);
      updateCart([]);
    } catch (e) {
      setOrderError(getPublicFormErrorMessage(e));
      turnstileRef.current?.reset();
      setTurnstileToken('');
    } finally {
      setIsPending(false)
    }
  }

  return (

    <main className="main checkout border-no">
      <Head>
        <title>Mac Plus | Оформление</title>
      </Head>

      <h1 className="d-none">Mac Plus - Оформление</h1>

      <div className={`page-content pt-7 pb-10 ${cartList.length > 0 ? 'mb-10' : 'mb-2'}`}>
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step"><ALink href="/pages/cart">1. Корзина</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">2. Оформление</ALink></h3>
          <h3 className="title title-simple title-step">3. Подтверждение</h3>
        </div>
        <div className="container mt-7">
          {
            cartList.length > 0 ?
              <>
                <form onSubmit={submitHandler} className="form">
                  <div className="row">
                    <div className="col-lg-7 mb-6 mb-lg-0 pr-lg-4">
                      <h3 className="title title-simple text-left text-uppercase">Детали заказа</h3>
                      <div className="row">
                        <div className="col-xs-12">
                          <label>Имя *</label>
                          <input type="text" className="form-control" name="name" required />
                        </div>
                      </div>
                      {
                        delivery[currentRadio].fields.length ? (
                          delivery[currentRadio].fields.map((item, index) => (
                            <div key={item + index}>
                              <label>{item} *</label>
                              <input type="text" className="form-control" name={item} required />
                            </div>
                          ))
                        ) : ''
                      }
                      <div className="row">
                        <div className="col-xs-6">
                          <label>Телефон *</label>
                          {/*<input type="text" className="form-control" name="phone" required />*/}
                          <PhoneInput
                            defaultCountry="BY"
                            labels={ru}
                            className="form-control"
                            value={phoneValue}
                            onBlur={() => setPhoneTouched(true)}
                            onChange={setPhoneValue}/>
                          {phoneTouched && !phoneValid ? (
                            <p className="checkout-error-message">Введите корректный номер телефона.</p>
                          ) : ''}
                        </div>
                        <div className="col-xs-6">
                          <label>Email</label>
                          <input type="text" className="form-control" name="email" />
                        </div>
                      </div>
                      <p>Поля, помеченные *, являются обязательными для заполнения.</p>

                      <h2 className="title title-simple text-uppercase text-left mt-6">Комментарий к заказу</h2>
                      <textarea className="form-control pb-2 pt-2 mb-0" cols="30" rows="5"
                        name="comment" placeholder="Дополнительная информация"></textarea>
                    </div>

                    <aside className="col-lg-5 sticky-sidebar-wrapper">
                      <div className="sticky-sidebar mt-1" data-sticky-options="{'bottom': 50}">
                        <div className="summary pt-5">
                          <h3 className="title title-simple text-left text-uppercase">Ваш заказ</h3>
                          <table className="order-table">
                            <thead>
                              <tr>
                                <th>Товары</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                cartList.map(item =>
                                  <tr key={'checkout-' + item.name}>
                                    <td className="product-name">{item.name} <span
                                      className="product-quantity">×&nbsp;{item.qty}</span></td>
                                    <td className="product-total text-body" style={{width: '120px'}}>{toDecimal(item.price * item.qty)} BYN</td>
                                  </tr>
                                )
                              }

                              <tr className="summary-subtotal">
                                <td>
                                  <h4 className="summary-subtitle">Стоимость</h4>
                                </td>
                                <td className="summary-subtotal-price pb-0 pt-0">{toDecimal(subTotalPrice)} BYN
                                </td>
                              </tr>
                              { !!discount && (
                                <tr className="summary-subtotal">
                                  <td>
                                    <h4 className="summary-subtitle">Скидка</h4>
                                  </td>
                                  <td className="summary-subtotal-price pb-0 pt-0">{toDecimal(discount)} BYN
                                  </td>
                                </tr>
                              )}
                              <tr className="sumnary-shipping shipping-row-last">
                                <td colSpan="2">
                                  <h4 className="summary-subtitle">Способ доставки</h4>
                                  <ul>
                                    {delivery.map((item, index) => (
                                      <li key={item._id}>
                                        <div className="custom-radio">
                                          <input type="radio" id={item._id} name="shipping" className="custom-control-input" onChange={() => radioHandler(index)} defaultChecked={index === 0 ? true : false} />
                                          <label className="custom-control-label" htmlFor={item._id}>{item.name}</label>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                              {deliveryPrice ? (<tr className="summary-total">
                                <td className="pb-0">
                                  <h4 className="summary-subtitle">Стоимость доставки</h4>
                                </td>
                                <td className=" pt-0 pb-0">
                                  <p className="summary-subtotal-price pb-0 pt-0">{toDecimal(deliveryPrice)} BYN</p>
                                </td>
                              </tr>) : (<></>)}
                              <tr className="summary-total">
                                <td className="pb-0">
                                  <h4 className="summary-subtitle">Всего</h4>
                                </td>
                                <td className="pt-0 pb-0">
                                  <p className="summary-total-price ls-s text-primary">{toDecimal(totalPrice)} BYN</p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="payment accordion radio-type">
                            <h4 className="summary-subtitle ls-m pb-3">Метод оплаты</h4>

                            <div className="checkbox-group">
                              {delivery[currentRadio].paymentMethods.map((item, index) => {
                                return (
                                  <div key={item._id}>
                                    <div className="card-header">
                                      <ALink href="#" className={`text-body text-normal ls-m ${index === payment ? 'collapse' : ''}`} onClick={() => { setPayment(index) }}>{item.name}</ALink>
                                    </div>

                                    <Collapse in={index === payment}>
                                      <div className="card-wrapper">
                                        <div className="card-body ls-m overflow-hidden">
                                          {item.description}
                                        </div>
                                      </div>
                                    </Collapse>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="form-checkbox mt-4 mb-5">
                            <input type="checkbox" className="custom-checkbox" id="terms-condition"
                              name="terms-condition" onChange={e => setIsTerms(!isTerms)} required />
                            <label className="form-control-label" htmlFor="terms-condition">
                              Я прочитал(а) <ALink href="/pages/privacy/"><u>правила обработки персональных данных</u></ALink> и соглашаюсь на обработку персональных данных *
                            </label>
                          </div>
                          <TurnstileWidget
                            ref={turnstileRef}
                            className="mb-4"
                            onToken={setTurnstileToken}
                          />
                          <FormStatus
                            type={isPending ? 'loading' : 'error'}
                            message={isPending ? 'Оформляем заказ…' : orderError}
                          />
                          <CheckoutButton
                            pending={isPending}
                            terms={isTerms}
                            phoneValid={phoneValid}
                            captchaReady={captchaReady}
                          />
                        </div>
                      </div>
                    </aside>
                  </div>
                </form>

              </>
              :
              <div className="empty-cart text-center">
                <p>Ваша корзина сейчас пуста.</p>
                <i className="cart-empty d-icon-bag"></i>
                <p className="return-to-shop mb-0">
                  <ALink className="button wc-backward btn btn-dark btn-md" href="/shop">
                    В каталог
                  </ALink>
                </p>
              </div>
          }
        </div>
      </div>
    </main>
  )
}

function mapStateToProps(state) {
  return {
    cartList: state.cart.data ? state.cart.data : []
  }
}

export default connect(mapStateToProps, { updateCart: cartActions.updateCart })(Checkout);
