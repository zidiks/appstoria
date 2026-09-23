import React from 'react';

import ALink from '~/components/features/custom-link';
import { getImgPath, getPostDate } from '~/utils';
import Image from 'next/image';

function PostSix(props) {
  const { post, adClass = 'post-sm', isLazy = false, isOriginal = false } = props;

  return (
    <div className={`post ${post.type === 'gallery' ? '' : 'overlay-zoom'} ${post.type === 'video' ? 'post-video' : ''} ${adClass}`}>
      {post.type === 'image' || post.type === 'video' ? (
        <figure style={{ borderRadius: '2rem', overflow: 'hidden' }} className="post-media">
          {isLazy ? <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>{isOriginal ? <Image src={getImgPath(post.media)} alt={post.seo?.seoImageAlt || post.title} title={post.seo?.seoTitle || post.title} width={380} height={230} loading="lazy" style={{ backgroundColor: '#DEE6E8' }} /> : <Image src={getImgPath(post.media)} alt={post.seo?.seoImageAlt || post.title} title={post.seo?.seoTitle || post.title} width={380} height={230} effect="opacity; transform" style={{ backgroundColor: '#DEE6E8' }} />}</ALink> : <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>{isOriginal ? <Image src={getImgPath(post.media)} alt={post.seo?.seoImageAlt || post.title} title={post.seo?.seoTitle || post.title} width={300} height={post.large_picture[0].height} /> : <Image src={getImgPath(post.media)} alt={post.seo?.seoImageAlt || post.title} title={post.seo?.seoTitle || post.title} width={300} height={post.picture[0].height} />}</ALink>}
        </figure>
      ) : (
        <figure style={{ borderRadius: '2rem', overflow: 'hidden' }} className="post-media">
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>
            <Image src={getImgPath(post.media)} alt={post.seo?.seoImageAlt || post.title} title={post.seo?.seoTitle || post.title} loading="lazy" width={760} height={460} style={{ backgroundColor: '#DEE6E8' }} />
          </ALink>
        </figure>
      )}

      <div className="post-details">
        <div className="post-meta">
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`} className="post-date">
            {getPostDate(post.createdAt)}
          </ALink>
        </div>
        <span className="post-title text-dark">
          <ALink href={`/blog/${post.seo?.seoUrl || '#'}`}>{post.title}</ALink>
        </span>
      </div>
    </div>
  );
}

export default PostSix;
