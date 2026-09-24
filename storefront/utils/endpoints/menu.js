import { fetchJson } from './fetch-json';
// В меню из админки macplus есть разделы, которых в этом форке нет
const REMOVED_SECTIONS = ['/blog', '/pages/reviews'];
const isRemovedLink = (item) => {
  const path = (item?.handle || '').replace(/\/+$/, '');
  return REMOVED_SECTIONS.some((section) => path === section || path.startsWith(`${section}/`));
};

export async function getMenuByCode(code) {
  const menu =
    (await fetchJson(process.env.API_HOST + '/store/menu/' + code)) || {
      children: [],
    };
  if (Array.isArray(menu.children)) {
    menu.children = menu.children.filter((item) => !isRemovedLink(item));
  }
  return menu;
}
