import React, {useEffect, useRef} from 'react';
import {getImgPath} from '~/utils';
import {Navigation} from "swiper/modules";
import {Swiper, SwiperSlide} from "swiper/react";
import Image from "next/image";
import clsx from "clsx";

function ThumbTwo({
  product,
  length = 0,
  currIndex = 0,
  onChangeIndex
}) {
  let thumbs = product.media;

  const swiperRef = useRef(null);

  useEffect(() => {
    if (currIndex !== swiperRef.current?.realIndex) {
      swiperRef.current?.slideTo(currIndex);
    }
  }, [currIndex]);

  return (
    <div className="mp-thumbs-wrapper">
      <Swiper
        pagination={{
          clickable: true,
        }}
        onSwiper={(swiper) => swiperRef.current = swiper}
        modules={[Navigation]}
        spaceBetween={2}
        slidesPerView={4}
        scrollbar={{draggable: true}}
      >
        {thumbs.map((thumb, index) => (
          <SwiperSlide
            key={thumb + '-2-' + index}
          >
            <div
              className={clsx('mp-thumbs-item', {
                'mp-thumbs-item-active': index === currIndex
              })}
              onClick={() => onChangeIndex(index)}
            >
              <Image
                className="mp-thumbs-image"
                src={getImgPath(thumb)}
                alt={`${product.seo?.seoImage[index]?.imageAlt || product.name}-${index + 1}`}
                title={`${product.seo?.seoTitle || product.name}-${index + 1}`}
                width={137}
                height={137}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default React.memo(ThumbTwo);
