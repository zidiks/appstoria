// Build-time configuration. All values can be overridden via environment
// variables (e.g. Docker build args), defaults point to production App:storia.
const NEXT_PUBLIC_HOST = (process.env.NEXT_PUBLIC_HOST || 'https://appstoria.by').replace(/\/+$/, '');
// Настоящий бэк. API_HOST — старое имя переменной, оставлено для совместимости
const API_UPSTREAM = (process.env.API_UPSTREAM || process.env.API_HOST || 'https://api.appstoria.by').replace(/\/+$/, '');
// API_PROXY=false — браузер ходит на бэк напрямую. Иначе запросы и картинки идут через
// {сайт}/api/*, а Next проксирует их на бэк: адрес бэка не светится в браузере
const API_PROXY = process.env.API_PROXY !== 'false';
const API_PUBLIC = API_PROXY ? `${NEXT_PUBLIC_HOST}/api` : API_UPSTREAM;
// Cloudflare Turnstile site key is domain-bound; empty value disables the widget.
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';

const publicUrl = new URL(API_PUBLIC);
const siteUrl = new URL(NEXT_PUBLIC_HOST);
const apexHost = siteUrl.hostname.replace(/^www\./, '');

// Сборка для shared-хостинга (npm run build:hoster): компактный standalone-сервер
// без полного node_modules и без оптимизатора картинок (ему нужен нативный sharp)
const HOSTER_BUILD = process.env.HOSTER_BUILD === 'true';

module.exports = {
    ...(HOSTER_BUILD ? { output: 'standalone' } : {}),
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        unoptimized: HOSTER_BUILD,
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: publicUrl.protocol.replace(':', ''),
                hostname: publicUrl.hostname,
                port: publicUrl.port,
            },
        ],
    },
    distDir: 'build',
    trailingSlash: true,
    // В код приложения (и в браузер) попадает только публичный адрес API
    env: {
        API_HOST: API_PUBLIC,
        NEXT_PUBLIC_HOST,
        TURNSTILE_SITE_KEY,
    },
    // Только для сервера: SSR ходит на бэк напрямую, минуя собственный прокси
    serverRuntimeConfig: {
        apiPublic: API_PUBLIC,
        apiUpstream: API_UPSTREAM,
    },
    rewrites: async () =>
        API_PROXY
            ? [{ source: '/api/:path*', destination: `${API_UPSTREAM}/:path*` }]
            : [],
    redirects: async () => {
        return [
            {
                source: '/:path*',
                has: [{ type: 'header', key: 'host', value: `www.${apexHost}` }],
                destination: `${siteUrl.protocol}//${apexHost}/:path*`,
                permanent: true,
            },
        ];
    },
}
