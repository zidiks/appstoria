/**
 * Настройки витрины App:storia, которые не зависят от бэка.
 *
 * Сейчас витрина работает на бэке macplus (API_HOST=https://api.macplus.by),
 * поэтому всё, что в его админке заведено под Mac Plus, перекрываем здесь.
 */
import { LEGAL_PAGE_TEMPLATES, renderLegalPage } from '~/content/legal-pages';

/**
 * Цена «до скидки». Цена из бэка (totalPrice) показывается как цена со скидкой,
 * а зачёркнутая цена — на percent% выше, с округлением вверх до «девятки»:
 * 49, 139, 1349, 12999. В заказ уходят только id товаров, сумму считает бэк,
 * так что реальная цена не меняется — меняется только витрина.
 */
export const PRICE_MARKUP = {
  enabled: true,
  percent: 30,
};

/**
 * Слайдер на главной.
 *   source: 'fields'   — картинки из полей-картинок админки (fields), пустые пропускаются;
 *   source: 'articles' — статьи с флагом «слайд», как на macplus.
 */
export const SLIDES = {
  source: 'fields',
  fields: ['appstoria-slide-1', 'appstoria-slide-2', 'appstoria-slide-3'],
};

/**
 * Продавец. Отсюда берутся реквизиты в футере, в YML-фиде и в юридических
 * страницах (content/legal-pages.js). Пустое значение — фраза с ним в тексты
 * не попадает.
 */
export const LEGAL = {
  name: 'ООО «МакПлюсТрейд»',
  // «Определяет деятельность …» — в родительном падеже
  nameGenitive: 'Общества с ограниченной ответственностью «МакПлюсТрейд»',
  unp: '491468179',
  regDate: '10.11.2023',
  // Юридический адрес (оферта, политика ПД: место нахождения и адрес для заявлений)
  address: '',
  // Банковские реквизиты одной строкой: р/с, банк, БИК
  bank: '',
  // Почта для обращений по персональным данным
  pdEmail: '',
  // Где проходит сервисное обслуживание (гарантия): название и адрес
  serviceCenter: '',
};

const legalPage = (code) => ({
  source: 'config',
  value: renderLegalPage(LEGAL_PAGE_TEMPLATES[code], {
    SITE_URL: 'https://appstoria.by',
    SITE_DOMAIN: 'appstoria.by',
    LEGAL_NAME: LEGAL.name,
    LEGAL_NAME_FULL: LEGAL.nameGenitive,
    UNP: LEGAL.unp,
    REG_DATE: LEGAL.regDate,
    LEGAL_ADDRESS: LEGAL.address,
    BANK: LEGAL.bank,
    PD_EMAIL: LEGAL.pdEmail,
    SERVICE_CENTER: LEGAL.serviceCenter,
  }),
});

/**
 * Поля «админки» (Field на бэке, /field/object?code=...).
 *   source: 'config' — всегда берём value отсюда, бэк не спрашиваем;
 *   source: 'api'    — берём из админки бэка (и прогоняем через TEXT_REPLACEMENTS,
 *                      если не указано rebrand: false). С from: 'другой-код' значение
 *                      берётся из другого поля бэка — так заводим поля только для appstoria.
 * Поля, которых здесь нет, берутся из бэка как есть.
 */
export const FIELDS = {
  // Контакты
  phone: { source: 'config', value: '+375 (29) 585-12-34' },
  // Пустая строка — почта на сайте не показывается
  email: { source: 'config', value: '' },
  address: { source: 'config', value: 'г. Гродно, ул. Подольная 37, 1-й этаж (здание кафе «Шервуд»)' },
  work_time: { source: 'config', value: 'Каждый день 11:00–20:00' },
  copyright: { source: 'config', value: ' App:storia' },
  // Реквизиты продавца
  legal: {
    source: 'config',
    value: `${LEGAL.name}\nУНП ${LEGAL.unp}\nДата регистрации в торговом реестре - ${LEGAL.regDate}.`,
  },

  // Соцсети и мессенджеры. Пустая строка — иконка не показывается.
  instagram: { source: 'config', value: 'https://www.instagram.com/appstoria/' },
  telegram: { source: 'config', value: '' },
  viber: { source: 'config', value: '' },
  whatsapp: { source: 'config', value: '' },

  // SEO. {TITLE} — название товара/категории/статьи, {CATEGORY} — категория.
  'main-seo-title': { source: 'config', value: 'App:storia — техника Apple в Гродно и по Беларуси' },
  'main-seo-description': { source: 'config', value: 'Новые и б/у iPhone, MacBook, iPad, Apple Watch и аксессуары. Trade-in, гарантия, доставка по Беларуси.' },
  'category-seo-header': { source: 'config', value: '{TITLE}' },
  'category-seo-title': { source: 'config', value: '{TITLE} — купить в App:storia' },
  'category-seo-description': { source: 'config', value: '✅ Выгодные цены на {TITLE} с доставкой по Беларуси. Только оригинальная техника Apple в App:storia.' },
  'product-seo-header': { source: 'config', value: '{TITLE}' },
  'product-seo-title': { source: 'config', value: '{TITLE} — купить в Гродно и Беларуси | App:storia' },
  'product-seo-description': { source: 'config', value: '✅ {TITLE} по выгодной цене с доставкой по Беларуси. ⭐ Купить {CATEGORY} в App:storia.' },

  // Фиды /ymlfeed.xml и /merchant.xml
  'yml-feed-name': { source: 'config', value: 'App:storia' },
  'yml-feed-link': { source: 'config', value: 'https://appstoria.by' },
  'yml-feed-company': { source: 'config', value: LEGAL.name },
  'yml-feed-delivery': { source: 'config', value: 'true' },

  // Главная
  features_1: { source: 'config', value: 'Быстрая доставка || d-icon-truck || 4.4' },
  features_2: { source: 'config', value: 'Бесплатная диагностика || d-icon-headphone || 3.4' },
  features_3: { source: 'config', value: 'Гарантия качества || d-icon-star || 3.7' },
  features_4: { source: 'config', value: 'Trade-in || d-icon-heart || 3.2' },
  'nav-limit': { source: 'config', value: '7' },
  'nav-sale-title': { source: 'config', value: 'Купить сейчас' },
  'nav-sale-link': { source: 'config', value: '/macbook/apple-macbook-air-13-m4/' },
  // Картинка в выпадающем меню каталога — отдельное поле appstoria в админке macplus
  'nav-sale-image': { source: 'api', from: 'appstoria-nav-sale-image' },

  // Trade-in
  'trade-in-title': { source: 'config', value: 'На всю технику' },
  'trade-in-subtitle': { source: 'config', value: 'предоставляем ГАРАНТИЮ 1 год' },
  'trade-in-description': { source: 'config', value: 'и 36 месяцев сервисного обслуживания' },

  // Юридические страницы — тексты в content/legal-pages.js, реквизиты из LEGAL
  'public-offer': legalPage('public-offer'),
  'privacy-policy': legalPage('privacy-policy'),
  'payment-terms': legalPage('payment-terms'),
  'delivery-terms': legalPage('delivery-terms'),
  warranty: legalPage('warranty'),
};

/**
 * Способы доставки на витрине. Сами способы (цена, порог бесплатной доставки,
 * поля, оплата) берутся с бэка macplus: заказ проверяется по их _id. Здесь —
 * только то, что видит покупатель. Способы, которых нет в списке, скрыты.
 */
export const DELIVERY_METHODS = {
  // на бэке: «Курьерская доставка Минск»
  '651f075d52ec98d085c945c8': {
    name: 'Курьерская доставка Гродно',
    description: 'Доставка курьером к вашей двери',
  },
  // на бэке: «Курьерская доставка Беларусь»
  '66e441b34a87f456a8d4bc9c': {
    name: 'Курьерская доставка Беларусь',
    description: 'Курьерская доставка до двери',
  },
};

/**
 * SEO конкретных страниц. Перекрывает раздел «SEO» админки бэка
 * (/seo/item?url=...) — поля, заданные здесь, главнее. url — путь без домена.
 */
export const SEO_BY_URL = {
  '/': {
    title: FIELDS['main-seo-title'].value,
    description: FIELDS['main-seo-description'].value,
    tag: 'App:storia — техника Apple в Гродно',
  },
};

/**
 * Замены в текстах, пришедших с бэка: SEO-страницы (/seo), SEO и описания
 * товаров/категорий/статей, поля с source: 'api'. Порядок важен. Имена файлов
 * и ссылки на картинки не трогаются.
 */
export const TEXT_REPLACEMENTS = [
  // Домен сайта (но не api.macplus.by — оттуда картинки)
  [/(?<![\w.-])(?:www\.)?macplus\.by/gi, 'appstoria.by'],
  [/\bmac\s?plus\b/gi, 'App:storia'],
  [/в Минске/g, 'в Беларуси'],
];

/**
 * Метка витрины в заявках: первой строкой в комментарии заказа и в тексте
 * быстрых заявок (1 клик, контакты) — так в Telegram-боте и админке macplus
 * видно, что заявка пришла с appstoria.
 */
export const SOURCE_TAG = '🟦 APPSTORIA.BY';
