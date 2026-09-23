import ALink from "~/components/features/custom-link";
import React, {useState} from "react";
import {useRouter} from "next/router";
import PostOne from "~/components/features/post/post-one";
import BlogPagination from "~/components/features/blog-pagination";
import Head from "next/head";

export default function PostList({posts, fullPath}) {
  const router = useRouter();
  const query = router.query;
  const showingCount = 8;
  const loading = false;
  const [perPage, setPerPage] = useState(showingCount);
  const totalPage = posts?.data ? parseInt(posts.metadata.lastPage) : 1;

  return (
    <main className="main skeleton-body">
      <Head>
        <title>Mac Plus | Блог</title>
      </Head>

      <h1 className="d-none">Mac Plus - Блог</h1>

      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb">
            <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
            <li><ALink href="#" className="active">Блог</ALink></li>
          </ul>
        </div>
      </nav>

      <div className="page-content with-sidebar">
        <div className="container">
          <div className="row gutter-lg">
            <div className="col-lg-9">
              <div className="posts">
                {
                  loading ?
                    new Array(parseInt(perPage)).fill(1).map((item, index) => (
                      <div key={"Skeleton:" + index}>
                        <div className="skel-post"></div>
                      </div>
                    )) :
                    posts ?
                      posts.data.slice(0, posts.length).map((post, index) => (
                        <React.Fragment key={"post-one" + index}>
                          <PostOne isFirst={index === 0} post={post}/>
                        </React.Fragment>
                      )) :
                      <div className="info-box with-icon"><p className="mt-4">No blogs were found matching your
                        selection.</p></div>
                }
              </div>

              <BlogPagination fullPath={fullPath} totalPage={totalPage}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
