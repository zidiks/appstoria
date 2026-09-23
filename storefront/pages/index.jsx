import React from 'react';
import IntroSection from '~/components/partials/home/intro-section';
import CategorySection from '~/components/partials/home/category-section';
import BannerSection from '~/components/partials/home/banner-section';
import ServiceBox from '~/components/partials/home/service-section';
import BlogSection from '~/components/partials/home/blog-section';
import {getLatestArticles} from '~/utils/endpoints/articles';
import {getRecProducts} from "~/utils/endpoints/products";
import {getSlides} from "~/utils/endpoints/slides";
import {getFieldsObject} from '~/utils/endpoints/fields';
import IntroCategories from "~/components/partials/home/intro-categories";
import {getSeoByUrl} from "~/utils/endpoints/seo";
import Head from "next/head";

export const getStaticProps = (async () => {
  const [
    articles,
    recProducts,
    slides,
    features,
    fields,
    seoMainMeta,
  ] = await Promise.all([
    getLatestArticles(),
    getRecProducts(),
    getSlides(),
    getFieldsObject('features_1', 'features_2', 'features_3', 'features_4'),
    getFieldsObject('trade-in-title', 'trade-in-subtitle' ,'trade-in-description', 'main-seo-title', 'main-seo-description'),
    getSeoByUrl(`/`),
  ]);
  return {
    props: {
      articles: articles.data,
      recProducts: recProducts.data,
      slides: slides.data,
      fields: fields,
      features: features,
      mainSeo: seoMainMeta,
    },
    revalidate: 600,
  }
})

export default function HomePage({ articles, recProducts, slides, fields, features, categoryTree, mainSeo }) {
  return (
    <div className="main home mt-lg-4 homepage">
      <Head>
        <title>{mainSeo?.title || fields['main-seo-title'] || 'Mac Plus'}</title>
        <meta property="og:title" content={mainSeo?.title || fields['main-seo-title'] || 'Mac Plus'}/>
        <meta name="description"
              content={mainSeo?.description || fields['main-seo-description'] || 'Интернет-магазин электроники в Беларуси'}/>
        <meta property="og:description"
              content={mainSeo?.description || fields['main-seo-description'] || 'Интернет-магазин электроники в Беларуси'}/>
        <meta name="keywords" content={mainSeo?.keywords}/>
      </Head>

      <h1 className="d-none">{mainSeo?.tag || fields['main-seo-title'] || 'Mac Plus'}</h1>

      <div className="page-content">
        <IntroSection slides={slides}/>

        <IntroCategories categories={categoryTree}></IntroCategories>

        <CategorySection recProducts={recProducts}/>

        <BannerSection
          tradeInDescription={fields['trade-in-description']}
          tradeInSubtitle={fields['trade-in-subtitle']}
          tradeInTitle={fields['trade-in-title']}
        />

        <ServiceBox fields={features}/>

        <BlogSection posts={articles}/>

        { mainSeo?.content && (
          <div
            className={`rendered-content container`}
            dangerouslySetInnerHTML={{__html: mainSeo?.content || ''}}
          ></div>
        )}
      </div>
    </div>
  )
}
