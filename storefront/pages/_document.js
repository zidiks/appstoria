import {Head, Html, Main, NextScript} from 'next/document';
import Script from "next/script";

const YANDEX_METRIKA_ID = 65770258;
const GA_MEASUREMENT_ID = 'G-M3P7BDYR85';

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        <Script strategy="afterInteractive" id="google-analytics-src"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        {/* gtag() stub is defined inline so events pushed during hydration are queued */}
        <script id="google-analytics"
                dangerouslySetInnerHTML={{
                  __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `
                }}
        />
        <Script strategy="afterInteractive" id="yandex-analytics"
                dangerouslySetInnerHTML={{
                  __html: `
                if (window) {
                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                 m[i].l=1*new Date();
                 for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                 k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                 (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                 ym(${YANDEX_METRIKA_ID}, "init", {
                      webvisor:true,
                      clickmap:true,
                      accurateTrackBounce:true,
                      trackLinks:true,
                      ecommerce:"dataLayer",
                 });
                }
            `
                }}
        />
        <base href="/"></base>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon.png"/>
        <link rel="icon" href="/images/icons/favicon.ico" sizes="any"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <meta name="theme-color" content="#ffffff"/>
        {/* Сайт только светлый: без этого браузеры с авто-тёмным режимом
            (Chrome Auto Dark Mode) сами инвертируют страницу */}
        <meta name="color-scheme" content="light"/>
      </Head>

      <body className="loaded">
      <noscript>
        <div><img src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`} style={{position: 'absolute', left: '-9999px'}} alt=""/>
        </div>
      </noscript>
      <Main/>
      <NextScript/>
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
      </body>
    </Html>
  )
}
