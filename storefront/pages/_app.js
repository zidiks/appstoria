import {useStore, Provider} from "react-redux";
import {wrapper} from "~/store";
import Layout from "~/components/layout";
import "~/public/sass/style.scss";
import {getCategoryTree} from "~/utils/endpoints/categoryTree";
import {getFieldsObject} from "~/utils/endpoints/fields";
import {getMenuByCode} from "~/utils/endpoints/menu";
import NextNProgress from 'nextjs-progressbar';
import React from "react";
import Head from 'next/head'
import ServiceUnavailable from '~/components/features/service-unavailable';
import {resolveLayoutData} from '~/utils/layout-data-cache';
import {isTemporaryApiError} from '~/utils/endpoints/fetch-json';

const App = ({Component, pageProps}) => {
  const store = useStore();
  const layoutFields = pageProps?.layoutFields || {};
  const categoryTree = pageProps?.categoryTree || [];
  const footerNav = pageProps?.footerNav || {children: []};

  const jsonLd = [
    {
      "@context": "http://schema.org",
      "@type": "WebSite",
      "url": "https://macplus.by/",
      "potentialAction":
        {
          "@type": "SearchAction",
          "target": "https://macplus.by/shop/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
    },
    {
      "@context": "http://schema.org",
      "@type": "Organization",
      "url": "https://macplus.by/",
      "logo": "https://macplus.by/images/home/logo.png",
      "name": "Интернет - магазин техники Apple",
      "email": `${layoutFields?.email}`,
      "address":
        {
          "addressLocality": `${layoutFields?.address}`
        },
      "contactPoint": [{
        "@type": "ContactPoint",
        "telephone": `${layoutFields?.phone}`,
        "contactType": "customer service"
      },
      {
        "@type": "ContactPoint",
        "telephone": `${layoutFields?.phone}`,
        "contactType": "customer service"
      }],
      "sameAs" : [
        `${layoutFields?.instagram}`
      ]
    },
    {
      "@context": "http://schema.org",
      "@type": "Store",
      "name": "Интернет - магазин техники Apple",
      "image": "https://macplus.by/images/home/logo.png",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Понедельник",
            "Вторник",
            "Среда",
            "Четверг",
            "Пятница",
            "Суббота",
          ],
          "opens": "09:00",
          "closes": "20:00"
        }
      ],
      "telephone": `${layoutFields?.phone}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Минск",
        "addressCountry": "Беларусь"
      }
    }
  ];

  return (
    <Provider store={store}>
      <NextNProgress color="#007945" />
      <Head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

        <title>{layoutFields["main-seo-title"] || "Mac Plus"}</title>
        <meta
          property="og:title"
          content={layoutFields["main-seo-title"] || "Mac Plus"}
        />
        <meta name="keywords" content="React Template"/>
        <meta
          name="description"
          content={
            layoutFields["main-seo-description"] ||
            "Интернет-магазин электроники в Беларуси"
          }
        />
        <meta
          property="og:description"
          content={
            layoutFields["main-seo-description"] ||
            "Интернет-магазин электроники в Беларуси"
          }
        />
        <meta name="author" content="Macplus"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
      </Head>
      <Layout
        categoryTree={categoryTree}
        layoutFields={layoutFields}
        footerNav={footerNav}
      >
        {pageProps?.serviceUnavailable ? (
          <ServiceUnavailable retryUrl={pageProps.retryUrl} />
        ) : (
          <Component {...pageProps} />
        )}
      </Layout>
    </Provider>
  )
};

App.getInitialProps = async ({Component, ctx}) => {
  const [
    categoryTreeResult,
    footerNavResult,
    layoutFieldsResult,
  ] = await Promise.allSettled([
    getCategoryTree(),
    getMenuByCode("footer_nav"),
    getFieldsObject(
      "telegram",
      "viber",
      "instagram",
      "whatsapp",
      "phone",
      "email",
      "address",
      "work_time",
      "copyright",
      "legal",
      "nav-sale-title",
      "nav-sale-link",
      "nav-sale-image",
      "main-seo-title",
      "main-seo-description",
      "nav-limit"
    )
  ]);
  const categoryTree = resolveLayoutData(
    'categoryTree',
    categoryTreeResult,
    {children: []},
  );
  const footerNav = resolveLayoutData(
    'footerNav',
    footerNavResult,
    {children: []},
  );
  const layoutFields = resolveLayoutData(
    'layoutFields',
    layoutFieldsResult,
    {},
  );
  let pageProps = {};
  if (Component.getInitialProps) {
    try {
      const pagePropsRes = await Component.getInitialProps(ctx);
      if (pagePropsRes) {
        pageProps = pagePropsRes;
      }
    } catch (error) {
      console.error(`[Page data unavailable: ${ctx.asPath || ctx.pathname}]`, error);
      if (!isTemporaryApiError(error)) {
        throw error;
      }

      if (ctx.res) {
        ctx.res.statusCode = 503;
      }
      pageProps = {
        serviceUnavailable: true,
        retryUrl: ctx.asPath || ctx.pathname || '/',
      };
    }
  }
  return {
    pageProps: Object.assign(pageProps, {
      categoryTree: categoryTree?.children || [],
      footerNav,
      layoutFields,
    }),
  };
};

export default wrapper.withRedux(App);
