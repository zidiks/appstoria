import React, {useEffect, useState} from 'react';
import ALink from '~/components/features/custom-link';
import SidebarFilterOne from '~/components/partials/shop/sidebar/sidebar-filter-one';
import ProductListOne from '~/components/partials/shop/product-list/product-list-one';
import {getImgPath} from '~/utils';
import Head from 'next/head';
import InlineSVG from "react-inlinesvg";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import {homeOutlineIcon} from "~/icons/home-outline";

export default function Category({ banner, products, filters, category, page, filterObject, filtersPairs, fullPath, mainSeo, seoFields, searchValue }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, filters]);
  const filtersString = Object.entries(filterObject)
    .map((filter) => `${filtersPairs[filter[0]]?.name} - ${filter[1].map((option) => `${filtersPairs[filter[0]]?.valuesPairs[option]}`).join(', ')}`)
    .join('; ');

  const collapseContent = () => {
    setIsCollapsed(!isCollapsed);
  };

  const categoryString = `${category.title || category.name || ''}`;

  const titleString = `${category.title || category.name || 'Каталог'}${filtersString.length ? `: ${filtersString}` : ''}`;

  const descriptionString = `${categoryString}${filtersString.length ? `: ${filtersString}` : ``}`;

  const headerString = `${category.title}${filtersString.length ? `: ${filtersString}` : ''}${page > 1 ? `; Страница №${page}` : ''}`;

  const interpolatedTitle = mainSeo?.title || seoFields['category-seo-title'].replaceAll('{TITLE}', titleString);
  const interpolatedDescription = mainSeo?.description || seoFields['category-seo-description'].replaceAll('{TITLE}', descriptionString);
  const interpolatedHeader = mainSeo?.tag || seoFields['category-seo-header'].replaceAll('{TITLE}', headerString);

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'ItemList',
    itemListElement: (products?.data || []).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${process.env.NEXT_PUBLIC_HOST || 'https://macplus.by'}/${item.categoryHandle ? item.categoryHandle + '/' : ''}${item.seo?.seoUrl || '#'}`,
    })),
  };

  const isNotFirstPage = page <= 1;

  const isFilterApplied = () => {
    return Object.values(filterObject).some((value) => Array.isArray(value) && value.length > 0);
  };

  useEffect(() => {
    isFilterApplied();
  }, [filterObject]);

  return (
    <main className="main bt-lg-none shop">
      <Head>
        <title>{interpolatedTitle}</title>
        <meta property="og:title" content={interpolatedTitle} />
        <meta name="description" content={interpolatedDescription} />
        <meta property="og:description" content={interpolatedDescription} />
        <meta name="keywords" content={(mainSeo?.keywords || category.keywords || []).join(', ')} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <h1 className="d-none">{interpolatedHeader}</h1>

      <div className="page-content mb-10 pb-2">
        <div className="container">
          <ul className="breadcrumb breadcrumb-sm">
            <li>
              <ALink href="/">
                <InlineSVG className="icon-16" src={homeOutlineIcon} />
              </ALink>
              <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon} />
            </li>
            <li>
              <ALink className="categories-link-desktop" href="/shop">
                Каталог
              </ALink>
              <ALink className="categories-link-mobile" href="/categories">
                Каталог
              </ALink>
              <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon} />
            </li>
            {category?.name && <li>
              <span className="breadcrumb-latest">{category.name}</span>
            </li>}
          </ul>

          <div className="row gutter-lg main-content-wrap">
            <SidebarFilterOne filters={filters} type="banner" filterObject={filterObject} />

            <div className="col-lg-9 main-content">
              {banner && (
                <div
                  className="shop-banner banner"
                  title={banner.seo?.seoImageAlt || ''}
                  style={{
                    backgroundImage: `url('${getImgPath(banner.media)}')`,
                    backgroundColor: '#f2f2f3',
                  }}
                >
                  <div className="banner-content">
                    <h4 className="banner-subtitle d-inline-block mb-2 text-uppercase ls-normal bg-dark" style={{ color: 'white', padding: '.5rem 1rem' }}>
                      {banner.description}
                    </h4>
                    <h1 className="banner-title font-weight-bold ls-normal text-uppercase">{banner.title}</h1>
                    <ALink href={`/blog/${banner.seo?.seoUrl || '#'}`} className="btn btn-outline btn-dark btn-rounded">
                      Подробнее
                    </ALink>
                  </div>
                </div>
              )}

              { searchValue && (
                <div className="search-results-value-title">
                  <span>Результаты по запросу <b>"{searchValue}"</b></span>
                </div>
              )}

              <ProductListOne products={products} type="banner" fullPath={fullPath}/>
              {!isFilterApplied() && isNotFirstPage && !!(mainSeo?.content || category.content) && (
                <>
                  <div className={`rendered-content ${!isCollapsed ? 'collapsed-content' : ''}`} dangerouslySetInnerHTML={{ __html: mainSeo?.content || category.content || '' }}></div>
                  <div onClick={collapseContent} className="collapsed-btn">
                    <div>{isCollapsed ? 'Скрыть' : 'Читать дальше'}</div>
                    <svg style={{ transform: isCollapsed ? 'rotateX(180deg)' : 'none' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
