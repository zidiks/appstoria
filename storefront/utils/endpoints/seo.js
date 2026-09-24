import { fetchJson } from './fetch-json';
import { SEO_BY_URL } from '~/site.config';

export async function getSeoByUrl(url) {
  let seo = null;
  try {
    seo = (await fetchJson(process.env.API_HOST + `/seo/item?url=${url}`)) || null;
  } catch (e) {
    seo = null;
  }
  const override = SEO_BY_URL[url];
  return override ? { ...(seo || {}), url, ...override } : seo;
}

export async function getAllSeo() {
  try {
    return (await fetchJson(process.env.API_HOST + `/seo`)) || null;
  } catch (e) {
    return null;
  }
}
