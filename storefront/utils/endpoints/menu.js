import { fetchJson } from './fetch-json';

export async function getMenuByCode(code) {
  return (
    (await fetchJson(process.env.API_HOST + '/store/menu/' + code)) || {
      children: [],
    }
  );
}
