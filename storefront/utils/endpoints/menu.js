import { fetchJson } from './fetch-json';
import { FEATURES } from '~/site.config';

const isBlogLink = (item) => /^\/blog(\/|$)/.test(item?.handle || '');

export async function getMenuByCode(code) {
  const menu =
    (await fetchJson(process.env.API_HOST + '/store/menu/' + code)) || {
      children: [],
    };
  if (!FEATURES.blog && Array.isArray(menu.children)) {
    menu.children = menu.children.filter((item) => !isBlogLink(item));
  }
  return menu;
}
