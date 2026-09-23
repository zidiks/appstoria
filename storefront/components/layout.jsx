import {useEffect} from 'react';
import Header from '~/components/common/header';
import Footer from '~/components/common/footer';
import StickyFooter from '~/components/common/sticky-footer';
import MobileMenu from '~/components/common/partials/mobile-menu';
import 'react-toastify/dist/ReactToastify.css';

import {scrollTopHandler, showScrollTopHandler, stickyFooterHandler, stickyHeaderHandler} from '~/utils';
import {Poppins} from "next/font/google";
import {ToastContainer} from "react-toastify";
import InlineSVG from "react-inlinesvg";
import {arrowUpOutlineIcon} from "~/icons/arrow-up-outline";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
})

function Layout({ children, categoryTree, layoutFields, footerNav }) {

  if (typeof  window !== 'undefined') {

    useEffect(() => {
      window.addEventListener('scroll', showScrollTopHandler, true);
      window.addEventListener('scroll', stickyHeaderHandler, true);
      window.addEventListener('scroll', stickyFooterHandler, true);
      window.addEventListener('resize', stickyHeaderHandler, true);
      window.addEventListener('resize', stickyFooterHandler, true);

      return () => {
        window.removeEventListener('scroll', showScrollTopHandler, true);
        window.removeEventListener('scroll', stickyHeaderHandler, true);
        window.removeEventListener('scroll', stickyFooterHandler, true);
        window.removeEventListener('resize', stickyHeaderHandler, true);
        window.removeEventListener('resize', stickyFooterHandler, true);
      }
    }, [])
  }

  return (
    <>
      <div className={`page-wrapper ${poppins.className}`}>
        <Header categoryTree={categoryTree} fields={layoutFields} />

        {children}

        <Footer categoryTree={categoryTree} fields={layoutFields} footerNav={footerNav} />

        <StickyFooter phone={layoutFields.phone} />
      </div>

      <div id="scroll-top" title="Top" role="button" className="scroll-top" onClick={() => scrollTopHandler(false)}>
        <InlineSVG className="scroll-top-icon" src={arrowUpOutlineIcon} />
      </div>

      <MobileMenu categoryTree={categoryTree} />

      <ToastContainer
        pauseOnHover={false}
        stacked
        position="bottom-left"
        hideProgressBar={true}
      />
    </>
  )
}

export default Layout;
