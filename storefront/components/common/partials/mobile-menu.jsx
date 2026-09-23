import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SlideToggle from 'react-slide-toggle';
import ALink from '~/components/features/custom-link';
import {orderCategories} from "~/utils";
import InlineSVG from "react-inlinesvg";
import {categoriesIcons} from "~/utils/data/categories-icons";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import {searchOutlineIcon} from "~/icons/search-outline";
import clsx from "clsx";


function MobileMenu({ categoryTree }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    window.addEventListener('resize', hideMobileMenuHandler);

    return () => {
      window.removeEventListener('resize', hideMobileMenuHandler);
    }
  }, [])

  useEffect(() => {
    setSearch("");
    hideMobileMenu();
  }, [router.query])

  const hideMobileMenuHandler = () => {
    if (window.innerWidth > 991) {
      document.querySelector('body').classList.remove('mmenu-active');
    }
  }

  const hideMobileMenu = () => {
    document.querySelector('body').classList.remove('mmenu-active');
  }

  function onSearchChange(e) {
    setSearch(e.target.value);
  }

  function onSubmitSearchForm(e) {
    e.preventDefault();
    router.push({
      pathname: '/shop',
      query: {
        search: search
      }
    });
  }

  return (
    <div className="mobile-menu-wrapper">
      <div className="mobile-menu-overlay" onClick={hideMobileMenu}>
      </div>

      <ALink className="mobile-menu-close" href="#" onClick={hideMobileMenu}><i className="d-icon-times"></i></ALink>

      <div className="mobile-menu-container scrollable">
        <form action="#" className="input-wrapper" onSubmit={onSubmitSearchForm}>
          <input type="text" className="form-control" name="search" autoComplete="off" value={search} onChange={onSearchChange}
            placeholder="Поиск..." required />
          <button className="btn btn-search" type="submit">
            <InlineSVG className="icon-24" src={searchOutlineIcon} />
          </button>
        </form>

        <div className="tab tab-nav-simple tab-nav-boxed form-tab mt-5">
          <div className="nav nav-tabs nav-fill">
            <div className="nav-item">
              <span className="nav-link">Навигация</span>
            </div>
          </div>
          <div className="tab-content">
            <div>
              <ul className="mobile-menu">
                <li><ALink href="/">Главная</ALink></li>
                <li><ALink href="/categories" className="menu-title">Каталог</ALink></li>
                {categoryTree.sort(orderCategories).map((category, index) => {
                  const iconKey = category.icon?.split('||')[0];
                  const catIcon = categoriesIcons[iconKey]?.src;
                  return (
                    category.children.length ?
                      <SlideToggle duration={300} collapsed key={index} >
                        {({ onToggle, setCollapsibleElement, toggleState }) => (
                          <li className={`submenu ${toggleState === 'EXPANDED' ? 'show' : ''}`}>
                            <div onClick={e => { e.stopPropagation(); e.preventDefault(); onToggle(); }} className="toggle-div menu-item menu-item-toggle">
                              <div className="menu-item-left">
                                { catIcon ? (
                                  <InlineSVG className="menu-category-icon menu-category-icon-toggle" src={catIcon}/>
                                ) : (
                                  <ion-icon class="menu-category-icon menu-category-icon-toggle" name={iconKey}></ion-icon>
                                )}
                                {category.name}
                              </div>
                              {(!!category.children?.length) && (
                                <div>
                                  <InlineSVG className={clsx('menu-item-arrow', {
                                    'menu-item-arrow-expanded': toggleState === 'EXPANDED'
                                  })} src={chevronForwardOutlineIcon}/>
                                </div>
                              )}
                            </div>

                            <div ref={setCollapsibleElement} style={{ overflow: 'hidden' }}>
                              <ul style={{ display: "block", paddingLeft: '1rem' }}>
                                {category.children.sort(orderCategories).map((item, index) => (
                                  <li key={index}><ALink style={{fontWeight: 400}} href={{ pathname: `/${item.handle}` }} scroll={false}>{item.name}</ALink></li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        )}
                      </SlideToggle>
                      :
                      <li key={index}>
                        <ALink className="menu-item menu-item-toggle" href={{ pathname: `/${category.handle}` }}>
                          <div className="menu-item-left">
                            { catIcon ? (
                              <InlineSVG className="menu-category-icon menu-category-icon-toggle" src={catIcon}/>
                            ) : (
                              <ion-icon class="menu-category-icon menu-category-icon-toggle" name={iconKey}></ion-icon>
                            )}
                            {category.name}
                          </div>
                          {(!!category.children?.length) && (
                            <div>
                              <InlineSVG className="menu-item-arrow" src={chevronForwardOutlineIcon}/>
                            </div>
                          )}
                        </ALink>
                      </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MobileMenu);
