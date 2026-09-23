import { getProducts } from '~/utils/endpoints/products';
import { getFieldsObject } from '~/utils/endpoints/fields';
import { getDeliveryMethods } from '~/utils/endpoints/orders';
import { getImgPath, normalizeString } from '~/utils';

function generateMerchantFeed({ products, fields, deliveryMethods }) {
  const avDate = new Date();
  const newDate = new Date(avDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  const isoDate = newDate.toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
    <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
      <channel>
        <title>${fields['yml-feed-name']}</title>
        <link>${fields['yml-feed-link']}</link>
        ${(products?.data || [])
          .map(
            (product) => `
          <item>
            <g:id>${product._id}</g:id>
            <g:title>${normalizeString(product.name)}</g:title>
            <g:description>${normalizeString(product.description)}</g:description>
            <g:link>${fields['yml-feed-link']}/${product.categoryHandle}/${
              product.seo?.seoUrl
            }</g:link>
            <g:image_link>${
              product.media?.length ? getImgPath(product.media[0]) : undefined
            }</g:image_link>
            <g:condition>new</g:condition>
            <g:availability>${product.isStock ? 'in_stock' : 'backorder'}</g:availability>
            ${!product.isStock ? `<g:availability_date>${isoDate}</g:availability_date>` : ''}
            <g:price>${product.totalPrice} BYN</g:price>
            ${deliveryMethods.map(
              (method) =>
                `
                <g:shipping>
                  <g:country>BY</g:country>
                  <g:service>${method.name}</g:service>
                  <g:price>${method.deliveryPrice} BYN</g:price>
                </g:shipping>
              `
            )}
            <g:brand>${product.brand?.name || 'Apple'}</g:brand>
          </item>
        `
          )
          .join('')}
      </channel>
    </rss>
`;
}

function MerchantFeed() {}

export async function getServerSideProps({ res }) {
  const fields = await getFieldsObject('yml-feed-name', 'yml-feed-link');
  const deliveryMethods = await getDeliveryMethods();
  const products = await getProducts({
    preview: true,
    pagination: {
      page: 1,
      limit: 2000,
    },
  });
  products.data = (products.data || []).filter(product => product.isStock)
  const ymlFeed = generateMerchantFeed({ products, fields, deliveryMethods });

  res.setHeader('Content-Type', 'text/xml');
  res.write(ymlFeed);
  res.end();

  return {
    props: {},
  };
}

export default MerchantFeed;
