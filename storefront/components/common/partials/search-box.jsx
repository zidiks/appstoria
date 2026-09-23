import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {debounceTime, Subject} from "rxjs";

import ALink from "~/components/features/custom-link";
import {autocomplete} from "~/utils/endpoints/autocomplete";
import InlineSVG from "react-inlinesvg";
import {searchOutlineIcon} from "~/icons/search-outline";

export default function SearchForm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const onSearch = new Subject();
  const inputRef = useRef(null);

  onSearch.pipe(debounceTime(400)).subscribe((res) => {
    searchProducts(res).then((searchRes) => {
      setSearchResult(searchRes);
    });
  });

  async function searchProducts(text) {
    if (!text?.length) {
      return;
    }
    return await autocomplete(text);
  }

  useEffect(() => {
    setIsFocused(false);
    if (inputRef.current) {
      inputRef.current.value = '';
      setSearch('');
    }
  }, [router.pathname]);

  function onSearchChange(e) {
    setSearch(e.target.value);
    onSearch.next(e.target.value);
  }

  function onSubmitSearchForm(e) {
    e.preventDefault();
    router.push({
      pathname: "/shop",
      query: {
        search: search,
      },
    });
  }

  function onBlur() {
    setTimeout(() => {
      setIsFocused(false);
    }, 100)
  }

  return (
    <div className="header-search hs-simple">
      <form
        onFocus={() => setIsFocused(true)}
        onBlur={onBlur}
        onSubmit={onSubmitSearchForm}
        className="input-wrapper"
      >
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          name="search"
          autoComplete="off"
          onChange={(e) => onSearchChange(e)}
          placeholder="Поиск..."
          required
        />

        <button className="btn btn-search" type="submit">
          <InlineSVG className="icon-24" src={searchOutlineIcon} />
        </button>

        {(!!searchResult?.length && isFocused && !!search?.length) && (
          <div className="live-search-list scrollable bg-white">
            {searchResult &&
              searchResult.map((product, index) => (
                <ALink
                  href={`/${product.category.handle ? product.category.handle + "/" : ""}${
                    product.seoUrl || "#"
                  }`}
                  className="autocomplete-suggestion"
                  key={`search-result-${index}`}
                >
                  <div className="search-name">
                    {product.name}
                  </div>
                </ALink>
              ))}
          </div>
        )}
      </form>
    </div>
  );
}
