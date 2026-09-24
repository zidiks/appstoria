import { fetchJson } from './fetch-json';
// В меню из админки macplus есть «Блог» — в этом форке блога нет
const isBlogLink = (item) => /^\/blog(\/|$)/.test(item?.handle || '');

export async function getMenuByCode(code) {
  const menu =
    (await fetchJson(process.env.API_HOST + '/store/menu/' + code)) || {
      children: [],
    };
  if (Array.isArray(menu.children)) {
    menu.children = menu.children.filter((item) => !isBlogLink(item));
  }
  return menu;
}
