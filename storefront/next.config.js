// Build-time configuration. All values can be overridden via environment
// variables (e.g. Docker build args), defaults point to production App:storia.
const API_HOST = (process.env.API_HOST || 'https://api.appstoria.by').replace(/\/+$/, '');
const NEXT_PUBLIC_HOST = (process.env.NEXT_PUBLIC_HOST || 'https://appstoria.by').replace(/\/+$/, '');
// Cloudflare Turnstile site key is domain-bound; empty value disables the widget.
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';

const apiUrl = new URL(API_HOST);
const siteUrl = new URL(NEXT_PUBLIC_HOST);
const apexHost = siteUrl.hostname.replace(/^www\./, '');

module.exports = {
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: apiUrl.protocol.replace(':', ''),
                hostname: apiUrl.hostname,
                port: apiUrl.port,
            },
        ],
    },
    distDir: 'build',
    trailingSlash: true,
    env: {
        API_HOST,
        NEXT_PUBLIC_HOST,
        TURNSTILE_SITE_KEY,
    },
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
