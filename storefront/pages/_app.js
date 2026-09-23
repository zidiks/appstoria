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
import {
  CONTACTS,
  ORGANIZATION_DESCRIPTION,
  SITE_DESCRIPTION,
  SITE_LOGO,
  SITE_NAME,
  SITE_URL,
  SOCIALS,
} from '~/utils/site';

function withDefaults(fields, defaults) {
  const result = {...(fields || {})};
  Object.entries(defaults).forEach(([key, value]) => {
    if (result[key] === undefined || result[key] === null || String(result[key]).trim() === '') {
      result[key] = value;
    }
  });
  return result;
}

const App = ({Component, pageProps}) => {
  const store = useStore();
  // Admin fields win; brand contacts are used only when a field is missing/empty.
  const layoutFields = withDefaults(pageProps?.layoutFields, {
    phone: CONTACTS.phone,
    email: CONTACTS.email,
    address: `г. ${CONTACTS.city}, ${CONTACTS.streetAddress}`,
    work_time: CONTACTS.workTime,
  });
  const categoryTree = pageProps?.categoryTree || [];
  const footerNav = pageProps?.footerNav || {children: []};

  const telephone = layoutFields?.phone || CONTACTS.phone;
  const email = layoutFields?.email || CONTACTS.email;
  const sameAs = Array.from(new Set([...SOCIALS, layoutFields?.instagram].filter(Boolean)));
  const postalAddress = {
    "@type": "PostalAddress",
    "streetAddress": CONTACTS.streetAddress,
    "addressLocality": CONTACTS.city,
    "addressCountry": CONTACTS.country
  };

  const jsonLd = [
    {
      "@context": "http://schema.org",
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": `${SITE_URL}/`,
      "potentialAction":
        {
          "@type": "SearchAction",
          "target": `${SITE_URL}/shop/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
    },
    {
      "@context": "http://schema.org",
      "@type": "Organization",
      "name": SITE_NAME,
      "description": ORGANIZATION_DESCRIPTION,
      "url": `${SITE_URL}/`,
      "logo": `${SITE_URL}${SITE_LOGO}`,
      "email": email,
      "address": postalAddress,
      "contactPoint": [{
        "@type": "ContactPoint",
        "telephone": telephone,
        "contactType": "customer service"
      }],
      "sameAs": sameAs
    },
    {
      "@context": "http://schema.org",
      "@type": "Store",
      "name": SITE_NAME,
      "description": ORGANIZATION_DESCRIPTION,
      "url": `${SITE_URL}/`,
      "image": `${SITE_URL}${SITE_LOGO}`,
      "openingHours": "Mo-Su 12:00-20:00",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "12:00",
          "closes": "20:00"
        }
      ],
      "telephone": telephone,
      "email": email,
      "address": postalAddress,
      "sameAs": sameAs
    }
  ];

  return (
    <Provider store={store}>
      <NextNProgress color="#2C6DEC" />
      <Head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

        <title>{layoutFields["main-seo-title"] || SITE_NAME}</title>
        <meta
          property="og:title"
          content={layoutFields["main-seo-title"] || SITE_NAME}
        />
        <meta
          name="description"
          content={
            layoutFields["main-seo-description"] ||
            SITE_DESCRIPTION
          }
        />
        <meta
          property="og:description"
          content={
            layoutFields["main-seo-description"] ||
            SITE_DESCRIPTION
          }
        />
        <meta name="author" content={SITE_NAME}/>
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
