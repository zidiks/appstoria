import { getPublicFormToken } from './public-form';
import { fetchJson } from './fetch-json';
import { DELIVERY_METHODS } from '~/site.config';

// Способы доставки — с бэка (заказ проверяется по их _id), а название и описание —
// из site.config.js. Способы, которых нет в конфиге, на витрине не показываем.
export async function getDeliveryMethods() {
  const methods = (await fetchJson(process.env.API_HOST + '/store/delivery-method')) || [];
  return methods
    .filter((method) => DELIVERY_METHODS[method._id])
    .map((method) => ({ ...method, ...DELIVERY_METHODS[method._id] }));
}

export async function getPaymentMethods() {
  return (await fetchJson(process.env.API_HOST + '/store/payment-method')) || [];
}

export async function addOrder(obj) {
  const formToken = await getPublicFormToken('order');
  return fetchJson(process.env.API_HOST + '/store/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      {...obj, formToken}
    )
  });
}

export async function getOrderByCode(code) {
  return (
    (await fetchJson(process.env.API_HOST + '/store/order/tracking/' + code)) || {}
  );
}
