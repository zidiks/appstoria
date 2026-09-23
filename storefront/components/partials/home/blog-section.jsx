import React from "react";
import PostSix from "~/components/features/post/post-six";
import MpCarousel from "~/components/features/mp-carousel";
import {SwiperSlide} from "swiper/react";

function BlogSection(props) {
  const { posts } = props;

  return (
    <section className="blog container mt-10 pt-3 mb-10">
      <span className="title mb-1">Наш блог</span>
      { posts && (
        <MpCarousel
          length={posts?.length || 0}
          className="blog-section-carousel"
          hasPagination={(posts?.length || 0) > 1}
          slidesPerView={1}
          breakpoints={{
            430: {
              slidesPerView: 4,
              pagination: false
            }
          }}
        >
          {posts.map((post, index) => (
            <SwiperSlide key={index}>
              <PostSix
                post={post}
                adClass="overlay-zoom"
                isCalender={true}
                isAuthor={false}
                btnAdClass="btn-sm"
                btnText="Подробнее"
                isOriginal={true}
              />
            </SwiperSlide>
          ))}
        </MpCarousel>
      ) }
    </section>
  );
}

export default React.memo(BlogSection);
