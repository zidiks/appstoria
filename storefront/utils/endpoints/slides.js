import { fetchJson } from './fetch-json';
import { getFieldsObject } from './fields';
import { SLIDES } from '~/site.config';

// Слайды из полей: значение поля — имя картинки в хранилище бэка
async function getSlidesFromFields() {
  const fields = await getFieldsObject(...SLIDES.fields);
  const data = SLIDES.fields
    .map((code) => ({ code, media: fields[code] }))
    .filter(({ media }) => typeof media === 'string' && media.trim())
    .map(({ code, media }) => ({ _id: code, title: '', media: media.trim() }));
  return { data };
}

export async function getSlides() {
  if (SLIDES.source === 'fields') {
    return getSlidesFromFields();
  }
  let data = (await fetchJson(
    process.env.API_HOST +
      "/article?" +
      new URLSearchParams({
        isSlide: true,
      })
  )) || [];
  if (data?.data?.length) {
    data.data.forEach((slide) => {
      delete slide.content
    })
  }
  return data;
}

export async function getBannerSlide() {
  return (await fetchJson(
    process.env.API_HOST +
      "/article?" +
      new URLSearchParams({
        tags: ["banner"],
      })
  )) || [];
}
