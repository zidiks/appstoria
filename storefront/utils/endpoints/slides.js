import { fetchJson } from './fetch-json';

export async function getSlides() {
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
