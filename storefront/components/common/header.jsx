import ALink from '~/components/features/custom-link';
import { useRouter } from 'next/router';

import CartMenu from '~/components/common/partials/cart-menu';
import MainMenu from '~/components/common/partials/main-menu';
import SearchBox from '~/components/common/partials/search-box';
import { orderCategories } from '~/utils';
import Image from 'next/image';
import logoImage from '~/public/images/home/logo.png';
import InlineSVG from "react-inlinesvg";
import {menuOutlineIcon} from "~/icons/menu-outline";
import {callOutlineIcon} from "~/icons/call-outline";
import {viberIcon} from "~/icons/viber";
import {telegramIcon} from "~/icons/telegram";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import {categoriesIcons} from "~/utils/data/categories-icons";
import {whatsappIcon} from "~/icons/whatsapp";

export default function Header({ categoryTree, fields }) {
  const router = useRouter();

  const showMobileMenu = () => {
    document.querySelector('body').classList.add('mmenu-active');
  };

  return (
    <header className="header">
      <div className="header-middle sticky-header fix-top sticky-content">
        <div className="container">
          <div className="header-left">
            <div className="mobile-menu-toggle" onClick={showMobileMenu}>
              <InlineSVG className="mobile-menu-toggle-icon" src={menuOutlineIcon} />
            </div>

            <ALink href="/" className="logo">
              <Image style={{ height: '56px', width: 'auto' }} src={logoImage} alt={fields['main-seo-title']} title={fields['main-seo-title']} width={200} height={56} />
            </ALink>

            <SearchBox />
          </div>

          <div className="header-right">
            <ALink href={`tel:${fields.phone}`} className="icon-box icon-box-side">
              <div className="icon-box-icon">
                <InlineSVG src={callOutlineIcon} />
              </div>
              <div className="icon-box-content d-lg-show">
                <span className="icon-box-title d-block">Телефон:</span>
                <p>{fields.phone}</p>
              </div>
            </ALink>

            <span className="divider"></span>

            {fields.telegram && <ALink rel="nofollow" href={fields.telegram} className="social-link social-link-header social-telegram">
              <InlineSVG className="social-link-icon" src={telegramIcon} />
            </ALink>}
            {fields.viber && <ALink rel="nofollow" href={`viber://chat?number=${fields.viber}`} className="social-link social-link-header social-viber">
              <InlineSVG className="social-link-icon" src={viberIcon} />
            </ALink>}
            {fields.whatsapp && <ALink rel="nofollow" href={fields.whatsapp} className="social-link social-link-header social-whatsapp">
              <InlineSVG className="social-link-icon" src={whatsappIcon} />
            </ALink>}

            <span className="divider"></span>

            <CartMenu />
          </div>
        </div>
      </div>

      <div className="header-bottom has-dropdown pb-0">
        <div className="container d-flex align-items-center">
          <div className="dropdown category-dropdown has-border">
            <ALink href="/shop" className="header-catalog text-white font-weight-semi-bold category-toggle">
              <i className="d-icon-bars2"></i>
              <InlineSVG className="menu-catalog-icon" src={menuOutlineIcon} />
              <span className="menu-catalog-text">Каталог</span>
            </ALink>

            <div className="dropdown-box">
              <ul className="menu vertical-menu category-menu">
                <li>
                  <div className="menu-title">
                    Разделы каталога
                  </div>
                </li>

                {(categoryTree || []).sort(orderCategories).map((item, index) => {
                  const iconKey = item.icon?.split('||')[0];
                  const catIcon = categoriesIcons[iconKey]?.src;
                  return (
                    <li key={index} className={item.children?.length ? 'submenu' : ''}>
                      <ALink className="menu-item" href={{pathname: `/${item.handle}`}}>
                        <div className="menu-item-left">
                          { catIcon ? (
                            <InlineSVG className="menu-category-icon" src={catIcon}/>
                          ) : (
                            <ion-icon class="menu-category-icon" name={iconKey}></ion-icon>
                          )}
                          {item.name}
                        </div>
                        {(!!item.children?.length) && (
                          <div>
                            <InlineSVG className="menu-item-arrow" src={chevronForwardOutlineIcon}/>
                          </div>
                        )}
                      </ALink>
                      {item.children?.length > 0 && (
                        <ul>
                          {item.children.sort(orderCategories).map((item, index) => (
                            <li key={index}>
                              <ALink href={{pathname: `/${item.handle}`}}>{item.name}</ALink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <MainMenu layoutFields={fields} categoryTree={categoryTree}/>
        </div>
      </div>
    </header>
  );
}
