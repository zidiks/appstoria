# App:storia storefront

Next.js storefront for [App:storia](https://app-storia.by) — продажа и ремонт техники Apple в Гродно.

## Build-time configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_HOST` | `https://api.app-storia.by` | Backend API base URL (also used for `next/image` remote pattern) |
| `NEXT_PUBLIC_HOST` | `https://app-storia.by` | Public site URL (canonical links, JSON-LD, sitemap, feeds) |
| `TURNSTILE_SITE_KEY` | _(empty)_ | Cloudflare Turnstile site key; empty disables the captcha widget |

In Docker pass them as build args: `docker build --build-arg TURNSTILE_SITE_KEY=... .`
