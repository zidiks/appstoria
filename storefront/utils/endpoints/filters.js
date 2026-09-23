import { fetchJson } from './fetch-json';

export async function  getFilters(id) {
  return fetchJson(process.env.API_HOST + `/store/type/filters?${
    id ?
    new URLSearchParams({
      category: id,
    }).toString()
    : ''
  }`);
}
