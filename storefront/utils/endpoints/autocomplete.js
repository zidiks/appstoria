import { fetchJson } from './fetch-json';

export async function autocomplete(str) {
  return (
    (await fetchJson(process.env.API_HOST + '/store/autocomplete/' + str)) || []
  );
}
