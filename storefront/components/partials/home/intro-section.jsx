import React, {useState} from 'react';
import {getImgPath} from '~/utils';
import Image from 'next/image';
import MpCarousel from "~/components/features/mp-carousel";
import {SwiperSlide} from "swiper/react";
import Link from "next/link";

function IntroSection({ slides }) {
  const [index, setIndex] = useState(0);

  const setIndexHandler = (mediaIndex) => {
    if (mediaIndex !== index) {
      setIndex(mediaIndex);
    }
  };

  return (
    <div className="intro-section container">
      <div className="row">
        <div className="mb-4 mb-lg-0">
          <MpCarousel
            currIndex={index}
            length={slides?.length || 0}
            onSlideChange={(e) => setIndexHandler(e.realIndex || 0)}
            className="intro-section-carousel"
            hasNavigation={true}
            hasPagination={true}
            navOutside={true}
            autoplay={{
              delay: 5000,
              pauseOnMouseEnter: true
            }}
          >
            {(slides || []).map((item, index) => (
              <SwiperSlide key={index}>
                <Link href={`/blog/${item.seo?.seoUrl || '#'}`}>
                  <div className="intro-section-carousel-item">
                    <Image
                      className="intro-section-carousel-img"
                      src={getImgPath(item.media)}
                      alt={item.seo?.imageAlt || item.title}
                      title={item.seo?.seoTitle || item.title}
                      width={1400}
                      height={546}
                      priority={index === 0}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                    />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </MpCarousel>
        </div>
      </div>
    </div>
  );
}

export default React.memo(IntroSection);
