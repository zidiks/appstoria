import { fetchJson } from './fetch-json';

export async function getCalculation(products = [], deliveryMethod = undefined) {
  return fetchJson(process.env.API_HOST + `/calculation/discount`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products,
      deliveryMethod,
    })
  });
}
