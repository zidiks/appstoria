import { fetchJson } from './fetch-json';

export async function getArticles(page = 1, limit = 8) {
  const queryParams = new URLSearchParams({
    page,
    limit,
    hidden: false,
  }).toString();
  return (await fetchJson(process.env.API_HOST + `/article?${queryParams}`)) || [];
}

export async function getLatestArticles(limit = 4) {
  let data =
    (await fetchJson(process.env.API_HOST + `/article?limit=${limit}&hidden=false`)) ||
    [];
  if (data?.data?.length) {
    data.data.forEach((article) => {
      delete article.content
      delete article.description
    })
  }
  return data
}

export async function getArticleById(id) {
  return (await fetchJson(process.env.API_HOST + "/article/" + id)) || [];
}

export async function getArticleBySlug(slug) {
  return (await fetchJson(process.env.API_HOST + `/article/item?slug=${slug}`)) || [];
}
