import { getImgPath, getPostDate } from '~/utils';
import ALink from '~/components/features/custom-link';
import React from 'react';
import Head from 'next/head';
import Image from "next/image";
import InlineSVG from "react-inlinesvg";
import {homeOutlineIcon} from "~/icons/home-outline";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";

export default function PostSingle({ post, seoFields }) {
  const loading = false;
  const ogImage = post.media;
  const titleString = `${post.seo?.seoTitle || post.title || 'Mac Plus'}`;
  const descriptionString = `${post.seo?.seoTitle || post.title || ''}`;

  const interpolatedTitle = seoFields['blog-seo-title'].replaceAll('{TITLE}', titleString);
  const interpolatedDescription = seoFields['blog-seo-description'].replaceAll('{TITLE}', descriptionString);

  return (
    <main className="main skeleton-body">
      <Head>
        <title>{interpolatedTitle}</title>
        <meta property="og:title" content={interpolatedTitle} />
        <meta name="description" content={interpolatedDescription} />
        <meta property="og:description" content={interpolatedDescription} />
        <meta name="keywords" content={post.seo?.seoKeywords?.join(', ')} />
        <meta name="author" content={post.seo?.seoAuthor || 'Mac Plus'} />
        {ogImage && <meta property="og:image" content={getImgPath(ogImage)} />}
      </Head>

      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb breadcrumb-sm">
            <li>
              <ALink href="/">
                <InlineSVG className="icon-16" src={homeOutlineIcon}/>
              </ALink>
              <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
            </li>
            <li>
              <ALink href="/blog" className="active">
                Блог
              </ALink>
              <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
            </li>
            {post.title && <li itemProp="name">
              <span className="breadcrumb-latest">{post.title}</span>
            </li>}
          </ul>
        </div>
      </nav>

      <div className="page-content with-sidebar">
        <div className="container">
        <div className="row gutter-lg">
            <div className="col-lg-9">
              {loading ? (
                <div className="skel-post"></div>
              ) : (
                <div className={`post post-single`}>
                  <figure className="post-media">
                    <Image
                      className="post-cover"
                      priority
                      src={getImgPath(post.media)}
                      alt={post.seo?.seoImageAlt || post.title || ''}
                      title={post.seo?.seoTitle || post.title || ''}
                      width={1800}
                      height={1000}
                    />
                  </figure>
                  <div className="post-details">
                    <div className="post-meta">
                    <ALink href="#" className="post-date">
                        {getPostDate(post.createdAt)}
                      </ALink>
                    </div>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-body mb-7" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
