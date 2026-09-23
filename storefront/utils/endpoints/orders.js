import { getPublicFormToken } from './public-form';
import { fetchJson } from './fetch-json';

export async function getDeliveryMethods() {
  return (await fetchJson(process.env.API_HOST + '/store/delivery-method')) || [];
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
