import {getArticleBySlug, getArticles} from "~/utils/endpoints/articles";
import {getFieldsObject} from "~/utils/endpoints/fields";
import React, {useEffect} from "react";
import PostSingle from "~/components/items/post-single";
import PostList from "~/components/items/post-list";

GenericBlog.getInitialProps = async (context) => {
  const query = context.query;
  const subPath = context.query?.blog?.join('');
  const fullPath = `/blog/${context.query?.blog?.join('/')}`;
  if (subPath.startsWith('page-is-') || subPath === '') {
    console.log('list mode!');
    const {per_page} = query;
    const page = parseInt(fullPath.split("/page-is-")[1] || 1);
    const pagination = {
      page: Number(page) || 1,
      limit: 8,
    };
    const posts = await getArticles(pagination.page, pagination.limit);
    return {
      type: 'posts',
      posts: posts,
      fullPath: fullPath,
    }
  } else {
    console.log('post mode!');
    const post = await getArticleBySlug(query.blog);
    const seoFields = await getFieldsObject("blog-seo-title", "blog-seo-description");
    return {
      type: 'post',
      post: post,
      seoFields,
      fullPath: fullPath,
    };
  }
};

export default function GenericBlog({type, post, posts, seoFields, fullPath}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({top: 0, behavior: "smooth"});
    }
  }, [fullPath]);

  return (
    <>
      {type === 'post' ? <PostSingle post={post} seoFields={seoFields}/> :
        <PostList fullPath={fullPath} posts={posts} seoFields={seoFields}/>}
    </>
  )
}
