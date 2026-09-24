import { getPublicFormToken } from './public-form';
import { fetchJson } from './fetch-json';
import { SOURCE_TAG } from '~/site.config';

export async function sendMessage({name, phone, message, website = '', turnstileToken}) {
  const formToken = await getPublicFormToken('quick-message');
  return fetchJson(process.env.API_HOST + '/notify/message', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    // Заявка уходит в общий бот macplus — первой строкой помечаем витрину
    body: JSON.stringify({
      name,
      phone,
      message: [SOURCE_TAG, message].filter(Boolean).join('\n'),
      website,
      turnstileToken,
      formToken,
    }),
  });
}
