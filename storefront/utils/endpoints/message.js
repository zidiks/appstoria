import { getPublicFormToken } from './public-form';
import { fetchJson } from './fetch-json';

export async function sendMessage({name, phone, message, website = '', turnstileToken}) {
  const formToken = await getPublicFormToken('quick-message');
  return fetchJson(process.env.API_HOST + '/notify/message', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({name, phone, message, website, turnstileToken, formToken}),
  });
}
