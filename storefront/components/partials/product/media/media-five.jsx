import {useEffect, useState} from 'react';
import Image from 'next/image';

import ThumbTwo from '~/components/partials/product/thumb/thumb-two';
import {getImgPath} from '~/utils';
import {SwiperSlide} from "swiper/react";
import MpCarousel from "~/components/features/mp-carousel";

export default function MediaFive(props) {
  const { product, adClass = '' } = props;
  const [index, setIndex] = useState(0);
  const [mediaRef, setMediaRef] = useState(null);

  let lgImages = product.seo?.seoImage || [];

  useEffect(() => {
    if (mediaRef !== null && mediaRef.current !== null && index >= 0) {
      mediaRef.current.$car.to(index, 300, true);
    }
  }, [index]);

  const setIndexHandler = (mediaIndex) => {
    if (mediaIndex !== index) {
      setIndex(mediaIndex);
    }
  };

  return (
    <div className={`product-gallery product-gallery-vertical product-gallery-sticky ${adClass}`}>
      <div className="product-label-group">
        {product.isRec ? <label className="product-label label-top">Хит</label> : ''}

        {product.isNew ? <label className="product-label label-new">Новинка</label> : ''}

        {product.discount ? <label className="product-label label-sale">-{product.discount}%</label> : ''}
      </div>

      <MpCarousel
        currIndex={index}
        length={lgImages?.length || 0}
        onSlideChange={(e) => setIndexHandler(e.realIndex || 0)}
        className="mp-carousel-product-single"
        hasNavigation={true}
      >
        {lgImages.map((image, index) => (
          <SwiperSlide key={image.imageName + '-' + index}>
            <Image
              width={800}
              height={800}
              src={getImgPath(image.imageName)}
              alt={`${image.imageAlt || product.name || ''}-${index}`}
              title={`${image.imageAlt || product.name || ''}-${index}`}
              className="product-image large-image"
            />
          </SwiperSlide>
        ))}
      </MpCarousel>


      <ThumbTwo
        product={product}
        onChangeIndex={setIndexHandler}
        currIndex={index}
        length={lgImages?.length || 0}
      />
    </div>
  );
}
