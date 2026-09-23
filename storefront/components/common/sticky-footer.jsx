import {useEffect, useRef, useState} from 'react';
import ALink from '~/components/features/custom-link';
import InlineSVG from "react-inlinesvg";
import {homeOutlineBaseIcon} from "~/icons/home-outline-base";
import {listOutlineIcon} from "~/icons/list-outline";
import {bagOutlineIcon} from "~/icons/bag-outline";
import {callOutlineIcon} from "~/icons/call-outline";

export default function StickyFooter({phone}) {
  const footerRef = useRef(null);
  const scrollPos = useRef(0);
  const [isSticky, setSticky] = useState(false);

  const LINKS = [
    { href: '/', icon: homeOutlineBaseIcon, label: 'Главная', scale: 1 },
    { href: '/categories', icon: listOutlineIcon, label: 'Каталог', scale: 1.2 },
    { href: `tel:${phone}`, icon: callOutlineIcon, label: 'Позвонить', scale: 1 },
  { href: '/pages/cart', icon: bagOutlineIcon, label: 'Корзина', scale: 1.1 }
];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;
      const scrollingDown = currentY > scrollPos.current;
      scrollPos.current = currentY;

      const contentEl = document.querySelector('.page-content');
      const headerEl = document.querySelector('header');
      const contentTop = contentEl?.offsetTop ?? 0;
      const headerHeight = headerEl?.offsetHeight ?? 0;

      if (window.innerWidth < 768) {
        if (currentY >= contentTop + headerHeight + 100 && scrollingDown) {
          setSticky(true);
        } else {
          setSticky(false);
        }
      } else {
        setSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const footerStyle = footerRef.current
    ? { marginBottom: isSticky ? 0 : `-${footerRef.current.offsetHeight}px` }
    : {};

  return (
    <div
      ref={footerRef}
      className={`sticky-footer sticky-content fix-bottom ${isSticky ? 'fixed' : ''}`}
      style={footerStyle}
    >
      {LINKS.map(({ href, icon, label, scale }) => (
        <ALink key={href} href={href} className="sticky-link">
          <InlineSVG
            className="icon-24"
            src={icon}
            style={{ transform: `scale(${scale})` }}
          />
          <span>{label}</span>
        </ALink>
      ))}
    </div>
  );
}
