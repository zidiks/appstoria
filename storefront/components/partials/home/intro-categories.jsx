import ALink from "~/components/features/custom-link";
import React from "react";
import {orderCategories} from "~/utils";
import SlideToggle from "react-slide-toggle";

function IntroCategories ({ categories }) {

  return (
    <section className="mt-5 intro_categories-wrapper">
      <div className="intro_categories">
        {categories.sort(orderCategories).map((category, index) => (
          category.children.length ?
            <SlideToggle duration={300} collapsed key={index}>
              {({onToggle, setCollapsibleElement, toggleState}) => (
                <div className={`intro_categories__toggle ${toggleState === 'EXPANDED' ? 'show' : ''}`}>
                  <div onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    onToggle();
                  }} className={`container intro_categories__item ${toggleState.toLowerCase()}`}>
                    <div className="intro_categories__icon-wrapper">
                      <div className="intro_categories__icon">
                        <i style={{fontSize: `${category.icon.split('||')[1] || '1.8'}rem`}}
                           className={category.icon.split('||')[0] || 'd-icon-arrow-right'}></i>
                      </div>
                      <span className="intro_categories__name">{category.name}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className={`intro_categories__arrow ${toggleState.toLowerCase()}`} viewBox="0 0 512 512">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth="48"
                            d="M184 112l144 144-144 144"/>
                    </svg>
                  </div>

                  <div ref={setCollapsibleElement} style={{overflow: 'hidden'}}>
                    <div className="intro_categories intro_categories-sub">
                      {category.children.sort(orderCategories).map((item, index) => (
                        <ALink key={index} href={`/${item.handle}`} className="container intro_categories__item">
                          <div className="intro_categories__icon-wrapper">
                            <div className="intro_categories__icon">

                            </div>
                            <span className="intro_categories__name">{item.name}</span>
                          </div>
                        </ALink>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SlideToggle>
            :
            <ALink key={index} className="container intro_categories__item" href={`/${category.handle}`}>
              <div className="intro_categories__icon-wrapper">
                <div className="intro_categories__icon">
                  <i style={{fontSize: `${category.icon.split('||')[1] || '1.8'}rem`}}
                     className={category.icon.split('||')[0] || 'd-icon-arrow-right'}></i>
                </div>
                <span className="intro_categories__name">{category.name}</span>
              </div>
            </ALink>
        ))}
      </div>
    </section>
  )
}

export default React.memo(IntroCategories);