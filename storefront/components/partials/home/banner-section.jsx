import React from 'react';
import Reveal from 'react-awesome-reveal';
import gearImage from '~/public/images/gear.svg';
import guyImage from '~/public/images/appstoria_guy.webp';
import {fadeIn} from '~/utils/data/keyframes';
import Image from 'next/image';
import ALink from "~/components/features/custom-link";

function BannerSection({ tradeInTitle, tradeInSubtitle, tradeInDescription }) {
  return (
    <ALink href="pages/warranty">
      <section className="banner-group container mt-10 pb-4 pt-2 mb-10">
        <Reveal keyframes={fadeIn} delay={200} duration={1200} triggerOnce>
          <div className="banner1 banner banner-section-wrapper" style={{ overflow: 'hidden', borderRadius: '2rem' }}>
            <Image src={guyImage} alt="App:storia — гарантия" width={341} height={426} loading="lazy" className="banner-guy" />
            <div className="banner-content">
              <div>
                <Image src={gearImage} alt="guarantee" title="guarantee" width={60} height={60} loading="lazy" className="banner-icon mb-4" />
              </div>
              {[tradeInTitle, tradeInSubtitle, tradeInDescription].filter(Boolean).map((line) => (
                <span key={line} className="banner-title text-white ls-normal lh-1">{line}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </ALink>
  );
}

export default React.memo(BannerSection);
