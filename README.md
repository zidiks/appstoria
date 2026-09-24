# App:storia

Монорепо интернет-магазина [appstoria.by](https://appstoria.by) — форк платформы mac-plus.

| Папка | Что это | Стек | Домен |
|---|---|---|---|
| `backend/` | API | NestJS 9, MongoDB | api.appstoria.by |
| `storefront/` | Витрина | Next.js 15 | appstoria.by |
| `dashboard/` | Админка | Angular 14, Taiga UI | admin.appstoria.by |
| `deploy/` | Caddy (reverse proxy + HTTPS) | | |
| `branding/` | Исходники логотипов | | |

История исходных репозиториев сохранена (`git subtree`). Подтянуть свежие изменения из апстрима:

```bash
git subtree pull --prefix=backend ../mac-plus-be main
git subtree pull --prefix=storefront ../mac-plus-fe main
git subtree pull --prefix=dashboard ../mac-plus-dashboard main
```

## Деплой на VPS

Нужны Docker с compose-плагином и DNS: `appstoria.by`, `www.appstoria.by`, `api.appstoria.by` и `admin.appstoria.by` смотрят на IP сервера. Порты 80 и 443 должны быть открыты.

```bash
git clone https://github.com/zidiks/appstoria.git && cd appstoria
cp .env.example .env   # заполнить пароли, JWT_SECRET, ADMIN_*
docker compose up -d --build
```

Caddy сам выпустит сертификаты Let's Encrypt. Первый администратор создаётся из `ADMIN_USERNAME` / `ADMIN_PASSWORD`, если в базе ещё нет админов.

Обновление: `git pull && docker compose up -d --build`.

Данные лежат в docker-томах: `mongo_data` (база), `storage` (картинки), `storage_originals` (оригиналы до обработки). Бэкап:

```bash
docker compose exec mongo sh -c 'mongodump -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --archive' > backup.archive
```

Адрес API вшивается в витрину при сборке (build args в `docker-compose.yml`), а в админку — через `dashboard/src/environments/environment.prod.ts`. Если меняете домены, пересоберите оба образа.

## Импорт товаров из merchant.xml

Раздел: админка → Настройки → «Импорт из merchant.xml». Источник — любой сайт на этой же платформе, его фид лежит по адресу `https://<сайт>/merchant.xml`.

- Раз в N часов (N задаётся в админке) бэкенд скачивает фид. Кнопка «Запустить» делает то же самое сразу.
- Цена из фида становится ценой со скидкой (`totalPrice`). Цена «до скидки» (`price`) выше на заданный процент, по умолчанию 30%, и округляется вверх до красивой: 49, 139, 1349, 12999. Процент скидки считается сам.
- Новые товары попадают в категорию с тем же handle, что и в ссылке у источника. Если такой нет, товар идёт в категорию по умолчанию. Фото скачиваются в хранилище.
- У уже импортированных товаров обновляются цена и наличие. Название, описание и фото обновляются, только если включена соответствующая галочка.
- Товары, которые пропали из фида, снимаются с наличия. Из каталога они не удаляются.
- Связь с источником хранится в полях `importSourceId` / `importExternalId` товара. Если удалить источник, товары останутся в каталоге и станут обычными.

## Что заполнить в админке после первого запуска

Раздел «Поля»: `phone`, `email`, `address`, `work_time`, `legal`, `copyright`, `instagram` / `telegram` / `viber` / `whatsapp`, `main-seo-title`, `main-seo-description`, `yml-feed-name`, `yml-feed-link` (`https://appstoria.by`), `yml-feed-company`, `yml-feed-delivery`, `yandex-reviews-org` (ID организации в Яндекс Картах для виджета отзывов), тексты страниц `delivery-terms`, `payment-terms`, `warranty`, `privacy-policy`, `public-offer`.
