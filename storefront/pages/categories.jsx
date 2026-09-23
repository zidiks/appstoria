import React, {useEffect} from "react";
import IntroCategories from "~/components/partials/home/intro-categories";
import {useRouter} from "next/router";

export default function CategoriesPage ({ categoryTree }) {
  const router = useRouter();

  useEffect(() => {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width > 991) {
      router.push('/shop');
    }
  }, []);

  return (
    <div style={{marginBottom: '4rem', marginTop: '-2.5rem'}}>
      <IntroCategories categories={categoryTree}></IntroCategories>
    </div>
  )
}
