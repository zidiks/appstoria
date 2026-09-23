import { fetchJson } from './fetch-json';

export async function getPublicFormToken(action) {
  const data = await fetchJson(
    process.env.API_HOST + `/security/public-form-token/${action}`,
  );
  return data.token;
}

export function getPublicFormErrorMessage(error) {
  if (error?.status === 429 || error?.reason === 'rate-limit') {
    return 'Слишком много запросов. Пожалуйста, попробуйте позже. Если заказ срочный, свяжитесь с нами по телефону или через страницу контактов.';
  }

  if (error?.reason === 'captcha') {
    return 'Не удалось пройти проверку безопасности. Отключите VPN или блокировщик, попробуйте другой браузер либо свяжитесь с нами по телефону или через страницу контактов, чтобы оформить заказ вручную.';
  }

  if (error?.reason === 'token') {
    return 'Форма устарела. Пожалуйста, попробуйте отправить ещё раз.';
  }

  if (error?.reason === 'origin') {
    return 'Не удалось подтвердить источник формы. Обновите страницу и попробуйте снова.';
  }

  if (error?.reason === 'honeypot') {
    return 'Заявка отклонена. Проверьте форму и попробуйте снова.';
  }

  return 'Произошла ошибка при отправке. Проверьте данные и попробуйте ещё раз.';
}
