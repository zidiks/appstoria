import {getArticles} from "~/utils/endpoints/articles";
import { FEATURES } from '~/site.config';
import {getCategories} from "~/utils/endpoints/categoryTree";
import {getProducts} from "~/utils/endpoints/products";
import {getAllSeo} from "~/utils/endpoints/seo";
import {SITE_URL} from '~/utils/site';

const host = SITE_URL;

function generateSiteMap({posts, categories, products, filters}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${host}/</loc>
     </url>
     <url>
       <loc>${host}/pages/contact-us</loc>
     </url>
     <url>
       <loc>${host}/pages/trade-in</loc>
     </url>
     ${(categories || []).map(item => {
      return `
         <url>
             <loc>${`${host}/${item.handle === 'root' ? 'shop' : item.handle}`}</loc>
         </url>
        `;
     }).join('')}
     ${(filters || []).map(item => {
      return `
         <url>
             <loc>${`${host}${item.url}`}</loc>
         </url>
          `;
      }).join('')}
     ${(products?.data || []).map(item => {
      return `
         <url>
             <loc>${`${host}/${item.categoryHandle}/${item.seo?.seoUrl}`}</loc>
         </url>
        `;
     }).join('')}
     ${FEATURES.blog ? `<url>
       <loc>${host}/blog</loc>
     </url>` : ''}
     ${(FEATURES.blog ? posts?.data || [] : []).map(item => {
      return `
       <url>
           <loc>${`${host}/blog/${item.seo?.seoUrl}`}</loc>
       </url>
      `;
     }).join('')}
   </urlset>
 `;
}

function SiteMap() { }

export async function getServerSideProps({ res }) {
  const posts = FEATURES.blog ? await getArticles(1, 1000) : null;
  const categories = await getCategories();
  const filters = (await getAllSeo() || []).filter((item) => {
    return item.url?.includes('/filter/')
  });
  const products = await getProducts({
    preview: true,
    pagination: {
      page: 1,
      limit: 2000,
    },
  });

  const sitemap = generateSiteMap({posts, categories, products, filters});

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;