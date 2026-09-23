import {Head, Html, Main, NextScript} from 'next/document';
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        <Script strategy="afterInteractive" id="google-tag-manager"
                dangerouslySetInnerHTML={{
                  __html: `
                if (window) {
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-KZX7JHJG');
                }
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
              
                 ym(96220740, "init", {
                      webvisor:true,
                      clickmap:true,
                      accurateTrackBounce:true,
                      trackLinks:true,
                 });
                }
            `
                }}
        />
        <Script strategy="afterInteractive" id="meta-pixel"
                dangerouslySetInnerHTML={{
                  __html: `
               !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '1184434382543279');
                fbq('track', 'PageView');
            `
                }}
        />
        <Script strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
                var _mtm = window._mtm = window._mtm || [];
                 _mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });
                 (function () {
                     var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                     g.src = 'https://stat1.clickfraud.ru/js/container_v5tvjjul.js'; s.parentNode.insertBefore(g, s);
                 })();
            `
        }}/>
        <base href="/"></base>
        <link rel="icon" href="images/icons/favicon.ico"/>
        {/* Сайт только светлый: без этого браузеры с авто-тёмным режимом
            (Chrome Auto Dark Mode) сами инвертируют страницу */}
        <meta name="color-scheme" content="light"/>
        <meta name="google-site-verification" content="zkGKtNXlNUPH0rhw2sORnyS0J9USz7B6xXI0Gey3NwE"/>
      </Head>

      <body className="loaded">
      <noscript>
        <div><img src="https://mc.yandex.ru/watch/96220740" style={{position: 'absolute', left: '-9999px'}} alt=""/>
        </div>
      </noscript>
      <noscript>
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KZX7JHJG" height="0" width="0"
                style={{display: 'none', visibility: 'hidden'}}></iframe>
      </noscript>
      <noscript>
        <img src="https://www.facebook.com/tr?id=1184434382543279&ev=PageView&noscript=1" height="1" width="1"
             style={{display: 'none'}}/>
      </noscript>
      <Main/>
      <NextScript/>
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
      </body>
    </Html>
  )
}
