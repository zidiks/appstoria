// Site-wide brand constants. SITE_URL comes from NEXT_PUBLIC_HOST (see next.config.js).
export const SITE_URL = (process.env.NEXT_PUBLIC_HOST || 'https://appstoria.by').replace(/\/+$/, '');
export const SITE_NAME = 'App:storia';
export const SITE_DESCRIPTION = 'Продажа и ремонт техники Apple в Гродно';
export const ORGANIZATION_DESCRIPTION = 'Магазин и сервис техники Apple в Гродно';
export const SITE_LOGO = '/images/logo.svg';

export const CONTACTS = {
  phone: '+375 (29) 585-12-34',
  phoneHref: 'tel:+375295851234',
  phoneE164: '+375295851234',
  // Почту на сайте пока не показываем
  email: '',
  streetAddress: 'ул. Подольная 37, 1-й этаж (здание кафе «Шервуд»)',
  city: 'Гродно',
  country: 'Беларусь',
  workTime: 'Каждый день 11:00–20:00',
};

export const SOCIALS = [
  'https://www.instagram.com/appstoria/',
  'https://vk.com/appstoria.grodno',
  'https://www.facebook.com/appstoria.by/',
];
