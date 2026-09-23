import { getCategoryTree } from '~/utils/endpoints/categoryTree';
import { getProducts } from '~/utils/endpoints/products';
import { getFieldsObject } from '~/utils/endpoints/fields';
import { getImgPath, normalizeString } from '~/utils';

const host = process.env.NEXT_PUBLIC_HOST || 'https://macplus.by';

function generateYmlFeed({ categories, products, fields, categoriesKeys }) {
  const date = new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
    <yml_catalog date="${date.toISOString()}">
      <shop>
        <name>${fields['yml-feed-name']}</name>
        <company>${fields['yml-feed-company']}</company>
        <url>${host}</url>
        <categories>
          ${(categories || [])
            .reduce((acc, item) => {
              acc.push(`<category id="${categoriesKeys[item._id]}">${item.name || ''}</category>`);
              if (item.children?.length) {
                item.children.forEach((child) => {
                  acc.push(
                    `<category id="${categoriesKeys[child._id]}" parentId="${categoriesKeys[item._id]}">${
                      child.name || ''
                    }</category>`
                  );
                });
              }
              return acc;
            }, [])
            .join('')}
        </categories>
        <offers>
          ${(products?.data || [])
            .map((item) => {
              return `
              <offer id="${item._id}" available="${item.isStock}">
                <delivery>${fields['yml-feed-delivery']}</delivery>
                <name>${normalizeString(item.name || '')}</name>
                <vendor>${normalizeString(item.brand?.name || '')}</vendor>
                <url>${`${host}/${item.categoryHandle}/${item.seo?.seoUrl}`}</url>
                <price>${item.totalPrice || 0}</price>
                <oldprice>${item.price || 0}</oldprice>
                <enable_auto_discounts>true</enable_auto_discounts>
                <currencyId>BYN</currencyId>
                ${item.categoryId[0] ? `<categoryId>${categoriesKeys[item.categoryId[0]?._id]}</categoryId>` : ''}
                <picture>${item.media?.length ? getImgPath(item.media[0]) : undefined}</picture>
                <description>${normalizeString(item.description || '')}</description>       
              </offer>
            `;
            })
            .join('')}            
        </offers>
        <collections>
          ${(categories || [])
            .reduce((acc, item) => {
              acc.push(`
              <collection id="${categoriesKeys[item._id]}">
                <url>${host}/${item.handle}</url>
                <name>${item.name}</name>
                ${item.media[0] ? `<picture>${getImgPath(item.media[0])}</picture>` : ''}
                ${item.description ? `<description>${item.description}</description>` : ''}
              </collection>
              `);
              return acc;
            }, [])
            .join('')}
        </collections>
      </shop>
    </yml_catalog>
  `;
}

function YmlFeed() {}

export async function getServerSideProps({ res }) {
  const categoriesRoot = await getCategoryTree();
  const categories = categoriesRoot?.children;
  const categoriesKeys = categories.reduce((acc, item) => {
    acc[item._id] = item.numberId
    item.children.forEach((child) => {
      acc[child._id] = child.numberId
    })
    return acc;
  }, {})
  const fields = await getFieldsObject('yml-feed-name', 'yml-feed-company', 'yml-feed-delivery');
  const products = await getProducts({
    preview: true,
    pagination: {
      page: 1,
      limit: 2000,
    },
  });
  products.data = (products.data || []).filter(product => product.isStock)
  const ymlFeed = generateYmlFeed({ categories, products, fields, categoriesKeys });

  res.setHeader('Content-Type', 'text/xml');
  res.write(ymlFeed);
  res.end();

  return {
    props: {},
  };
}

export default YmlFeed;
