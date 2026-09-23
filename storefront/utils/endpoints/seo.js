import { fetchJson } from './fetch-json';

export async function getSeoByUrl(url) {
  try {
    return (await fetchJson(process.env.API_HOST + `/seo/item?url=${url}`)) || null;
  } catch (e) {
    return null;
  }
}

export async function getAllSeo() {
  try {
    return (await fetchJson(process.env.API_HOST + `/seo`)) || null;
  } catch (e) {
    return null;
  }
}
