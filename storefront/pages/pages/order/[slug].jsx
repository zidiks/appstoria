import {connect} from 'react-redux';
import ALink from '~/components/features/custom-link';
import {getPostDate, toDecimal} from '~/utils';
import {getOrderByCode} from '~/utils/endpoints/orders';
import Head from "next/head";

Order.getInitialProps = async (context) => {
  const code = context.asPath.split('/').filter(item => !!item).pop();
  const res = await getOrderByCode(code);
  return {
    order: res,
  }
}

function Order(props) {
  const { order } = props;
  return (
    <main className="main order">
      <Head>
        <title>Mac Plus | Заказ {order.orderCode}</title>
      </Head>

      <h1 className="d-none">Mac Plus - Заказ</h1>

      <div className="page-content pt-7 pb-10 mb-10">
        <div className="step-by pr-4 pl-4">
          <h3 className="title title-simple title-step"><ALink href="/pages/cart">1. Корзина</ALink></h3>
          <h3 className="title title-simple title-step"><ALink href="/pages/checkout">2. Оформление</ALink></h3>
          <h3 className="title title-simple title-step active"><ALink href="#">3. Подтверждение</ALink></h3>
        </div>
        <div className="container mt-8">
          <div className="order-message mr-auto ml-auto">
            <div className="icon-box d-inline-flex align-items-center">
              <div className="icon-box-icon mb-0">
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" enableBackground="new 0 0 50 50" xmlSpace="preserve">
                  <g>
                    <path fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="bevel" strokeMiterlimit="10" d="
                                        M33.3,3.9c-2.7-1.1-5.6-1.8-8.7-1.8c-12.3,0-22.4,10-22.4,22.4c0,12.3,10,22.4,22.4,22.4c12.3,0,22.4-10,22.4-22.4
                                        c0-0.7,0-1.4-0.1-2.1"></path>
                    <polyline fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="bevel" strokeMiterlimit="10" points="
                                        48,6.9 24.4,29.8 17.2,22.3 	"></polyline>
                  </g>
                </svg>
              </div>
              <div className="icon-box-content text-left">
                <h5 className="icon-box-title font-weight-bold lh-1 mb-1">Успешно оформлено!</h5>
                <p className="lh-1 ls-m">Ожидайте обработки оператором</p>
              </div>
            </div>
          </div>


          <div className="order-results">
            <div className="overview-item">
              <span>Код заказа:</span>
              <strong>{order.orderCode}</strong>
            </div>
            <div className="overview-item">
              <span>Статус:</span>
              <strong>{order.state.label}</strong>
            </div>
            <div className="overview-item">
              <span>Дата:</span>
              <strong>{getPostDate(order.createdAt)}</strong>
            </div>
            <div className="overview-item">
              <span>Имя:</span>
              <strong>{order.customer.name}</strong>
            </div>
            <div className="overview-item">
              <span>Телефон:</span>
              <strong>{order.customer.phone}</strong>
            </div>
          </div>

          <h2 className="title title-simple text-left pt-4 font-weight-bold text-uppercase">Детали заказа</h2>
          <div className="order-details">
            <table className="order-details-table">
              <thead>
                <tr className="summary-subtotal">
                  <td>
                    <h3 className="summary-subtitle">Товары</h3>
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {
                  order.cartItems.map(item =>
                    <tr key={'order-' + item.product._id}>
                      <td className="product-name">{item.product.name} <span> <i className="fas fa-times"></i> {item.count}</span></td>
                      <td className="product-price">{toDecimal(item.count * item.product.totalPrice)} BYN</td>
                    </tr>
                  )}
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Стоимость:</h4>
                  </td>
                  <td className="summary-subtotal-price">{toDecimal(order.subTotalPrice)} BYN</td>
                </tr>
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Скидка:</h4>
                  </td>
                  <td className="summary-subtotal-price">{toDecimal(order.totalDiscount)} BYN</td>
                </tr>
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Метод доставки:</h4>
                  </td>
                  <td className="summary-subtotal-price">{order.delivery.deliveryMethod.name}</td>
                </tr>
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Доставка:</h4>
                  </td>
                  <td className="summary-subtotal-price">{order.delivery.deliveryMethod.deliveryPrice ? `${order.delivery.deliveryMethod.deliveryPrice} BYN` : "Бесплатно"}</td>
                </tr>
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Метод оплаты:</h4>
                  </td>
                  <td className="summary-subtotal-price">{order.paymentMethod.name}</td>
                </tr>
                <tr className="summary-subtotal">
                  <td>
                    <h4 className="summary-subtitle">Итого:</h4>
                  </td>
                  <td>
                    <p className="summary-total-price">{toDecimal(order.totalPrice)} BYN</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {order.delivery.deliveryData.length ? (
            <div>
              <h2 className="title title-simple text-left pt-10 mb-2">Данные</h2>
              <div className="address-info pb-8 mb-6">
                <p className="address-detail pb-2">
                  {order.delivery.deliveryData.map(item => (
                    <span key={item.value}>{`${item.name}: ${item.value}`}<br /></span>
                  ))}
                </p>
              </div>
            </div>
          ) : (<br />)}
          <ALink href="/shop" className="btn btn-icon-left btn-dark btn-back btn-rounded btn-md mb-4"><i className="d-icon-arrow-left"></i> В каталог</ALink>
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

export default connect(mapStateToProps)(Order);
