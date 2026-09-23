import { fetchJson } from './fetch-json';

export async function getFieldsObject(...fieldStrings) {
  return (
    (await fetchJson(
      process.env.API_HOST + '/field/object?code=' + fieldStrings.join(','),
    )) || {}
  );
}
