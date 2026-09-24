import { fetchJson } from './fetch-json';
import { apiFieldCodes, applyFieldOverrides } from '~/utils/overrides';

// Часть полей захардкожена в site.config.js — у бэка спрашиваем только остальные
export async function getFieldsObject(...fieldStrings) {
  const codes = apiFieldCodes(fieldStrings);
  const apiFields = codes.length
    ? (await fetchJson(
        process.env.API_HOST + '/field/object?code=' + codes.join(','),
      )) || {}
    : {};
  return applyFieldOverrides(fieldStrings, apiFields);
}
