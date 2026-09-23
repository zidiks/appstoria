import React from 'react';

import ALink from '~/components/features/custom-link';

import {getImgPath, getPostDate} from '~/utils';
import Image from "next/image";

function PostOne(props) {
  const {
    post,
    adClass = 'mb-7',
    isLazy = false,
    isOriginal = false,
    btnText = 'Подробнее',
    btnAdClass = '',
    isButton = true,
    isFirst = false
  } = props;
  return (
    <div className={`post post-classic ${post.type === 'video' ? 'post-video' : ''} ${adClass}`}>
      <figure style={{borderRadius: '2rem', overflow: 'hidden'}}
              className={`post-media ${post.type === 'image' ? 'overlay-zoom' : ''}`}>
        {isLazy ? (
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>
            <Image width={1410} height={520} priority={isFirst} src={getImgPath(post.media)}
                   alt={post.seo?.seoImageAlt || post.title || ''} title={post.seo?.seoTitle || post.title || ''}
                   style={{backgroundColor: '#DEE6E8'}} className="post-cover-img"/>
          </ALink>
        ) : (
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>
            <Image width={1410} height={520} priority={isFirst} src={getImgPath(post.media)}
                   alt={post.seo?.seoImageAlt || post.title || ''} title={post.seo?.seoTitle || post.title || ''}
                   style={{backgroundColor: '#DEE6E8'}} className="post-cover-img"/>
          </ALink>
        )}
      </figure>

      <div className="post-details">
        <div className="post-meta">
          <ALink href="#" className="post-date">
            {getPostDate(post.createdAt)}
          </ALink>
        </div>
        <h4 className="post-title">
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>{post.title}</ALink>
        </h4>
        <p className="post-content">{post.description}</p>
        {isButton ? (
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}
                 className={`btn btn-link btn-underline btn-primary ${btnAdClass}`}>
            {btnText}
            <i className="d-icon-arrow-right"></i>
          </ALink>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export default PostOne;
