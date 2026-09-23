import { getItemBySlug } from "~/utils/endpoints/item";
import ProductItem from "~/components/items/product";
import { getProducts, getProductsAdvanced } from "~/utils/endpoints/products";
import { getDeliveryMethods } from "~/utils/endpoints/orders";
import { getFilters } from "~/utils/endpoints/filters";
import { getBannerSlide } from "~/utils/endpoints/slides";
import { getFieldsObject } from "~/utils/endpoints/fields";
import Category from "~/components/items/category";
import { parseFilterString } from "~/utils";
import CyrillicToTranslit from "cyrillic-to-translit-js";
import {getSeoByUrl} from "~/utils/endpoints/seo";

GenericCatalogueItem.getInitialProps = async ({ query, res }) => {
  const cyrillicToTranslit = new CyrillicToTranslit();
  const {
    catalogue,
    per_page,
    price,
    sortby,
    type,
    min_price,
    max_price,
    search,
    ...customProperties
  } = query;
  const fullPath = catalogue.join("/");
  const pathSegments = fullPath.split("/filter/");
  const page = parseInt(fullPath.split("/page-is-")[1] || 1);
  const filterString = pathSegments[1]?.split("/page-is-")[0] || null;
  const filterObject = parseFilterString(filterString);
  const path = pathSegments[0].split("/page-is-")[0];
  const [
    seoFields,
    seoMainMeta,
  ] = await Promise.all([
    getFieldsObject(
      "category-seo-header",
      "category-seo-title",
      "category-seo-description",
      "product-seo-header",
      "product-seo-title",
      "product-seo-description",
    ),
    getSeoByUrl(`/${fullPath}`)
  ]);

  const searchValue = (path === "shop" && search) ? search : null

  const item =
    path === "shop"
      ? {
          name: "Все товары",
          description: "Все товары каталога",
        }
      : await getItemBySlug(path);

  if (item?.statusCode === 404 && path !== "shop") {
    if (res) {
      res.writeHead(301, {
        Location: "/404",
        "Content-Type": "text/html; charset=utf-8",
      });
      res.end();
      return;
    }

    window.location = `${window.location.origin}/404`;
  }

  if (item?.price) {
    const [
      featuredRes,
      deliveryRes,
    ] = await Promise.all([
      getProductsAdvanced(item.category._id, item._id),
      getDeliveryMethods(),
    ]);
    return {
      featured: featuredRes || [],
      deliveryMethods: deliveryRes || [],
      data: item,
      type: "product",
      mainSeo: seoMainMeta,
      seoFields,
    };
  }

  const filters = item ? await getFilters(item._id) : [];
  const filtersPairs = filters.reduce((filterAcc, filterCurr) => {
    const optionsArr = [];
    const filterKey = [filterCurr.code || filterCurr._id];
    const valuesPairs = (filterAcc[filterKey] = filterCurr.options.reduce(
      (optionAcc, optionCurr) => {
        const translitOption = cyrillicToTranslit.transform(optionCurr, "_").toLowerCase();
        optionsArr.push({
          key: translitOption,
          value: optionCurr,
        });
        optionAcc[translitOption] = optionCurr;
        return optionAcc;
      },
      {}
    ));
    filterAcc[filterKey] = {
      valuesPairs,
      ...filterCurr,
    };
    filterCurr.options = optionsArr;
    return filterAcc;
  }, {});
  const filtersCodes = (filters || []).map((filterItem) => {
    return filterItem.code || filterItem._id;
  });
  const banner = await getBannerSlide();
  const requestFilters = {
    baseProperties: {},
    customProperties: {},
    preview: true,
    pagination: {
      page: Number(page) || 1,
      limit: Number(per_page) || 12,
    },
  };

  if (filterObject && Object.keys(filterObject).length) {
    requestFilters.customProperties = Object.keys(filterObject).reduce((acc, key) => {
      const values = filterObject[key];
      if (values?.length && values[0].length && filtersCodes.includes(key)) {
        const filterId = (filters || []).find((filter) => filter.code === key)?._id;
        if (values.length === 1) {
          acc[filterId || key] = {
            $eq: values[0] === "true" ? true : filtersPairs[key].valuesPairs[values[0]],
          };
        } else {
          acc[filterId || key] = {
            $in: values.map((val) => filtersPairs[key].valuesPairs[val]),
          };
        }
      }
      return acc;
    }, {});
  }
  if (min_price || max_price) {
    requestFilters.baseProperties.totalPrice = {};
    if (min_price) {
      requestFilters.baseProperties.totalPrice.$gte = Number(min_price);
    }
    if (max_price) {
      requestFilters.baseProperties.totalPrice.$lte = Number(max_price);
    }
  }
  if (item?._id) {
    requestFilters.baseProperties.categoryId = {
      $eq: item._id,
    };
  }
  if (search) {
    requestFilters.search = search;
  }
  if (sortby) {
    switch (sortby) {
      case "price-low":
        requestFilters.sort = {
          direction: 1,
          property: "totalPrice",
        };
        break;
      case "price-high":
        requestFilters.sort = {
          direction: -1,
          property: "totalPrice",
        };
        break;
    }
  }
  const products = await getProducts(requestFilters);

  const filterObjectEntries = Object.entries(filterObject);
  if (!!filterObjectEntries.length) {
    let isNotFound = false;
    filterObjectEntries
      .forEach((filter) => {
        if (!filtersPairs[filter[0]]) {
          isNotFound = true;
        } else {
          filter[1].forEach((option) => {
            if (!filtersPairs[filter[0]]?.valuesPairs[option]) {
              isNotFound = true
            }
          })
        }
      })

    if (isNotFound) {
      if (res) {
        res.writeHead(301, {
          Location: "/404",
          "Content-Type": "text/html; charset=utf-8",
        });
        res.end();
        return;
      }

      window.location = `${window.location.origin}/404`;
    }
  }

  return {
    page: page,
    banner: banner?.data[0],
    data: item,
    products: products,
    filters: filters.map((el) => {
      el.code = el.code || el._id;
      return el;
    }),
    type: "category",
    filterObject: filterObject,
    filtersPairs,
    fullPath: fullPath,
    mainSeo: seoMainMeta,
    seoFields,
    searchValue,
  };
};

export default function GenericCatalogueItem({
  data,
  type,
  featured,
  deliveryMethods,
  banner,
  filters,
  products,
  page,
  filterObject,
  filtersPairs,
  fullPath,
  mainSeo,
  seoFields,
  searchValue,
}) {
  return type === "product" ? (
    <ProductItem
      product={data}
      featured={featured}
      deliveryMethods={deliveryMethods}
      seoFields={seoFields}
      mainSeo={mainSeo}
    />
  ) : (
    <Category
      searchValue={searchValue}
      page={page}
      banner={banner}
      filters={filters}
      products={products}
      category={data}
      filterObject={filterObject}
      fullPath={fullPath}
      filtersPairs={filtersPairs}
      seoFields={seoFields}
      mainSeo={mainSeo}
    />
  );
}
