import React from 'react';
import Reveal from 'react-awesome-reveal';

import ALink from '~/components/features/custom-link';

import { fadeIn } from '~/utils/data/keyframes';
import { getImgPath } from '~/utils';
import Image from 'next/image';

export default function CategorySection({ recProducts }) {
  return (
    !!recProducts.length && (
      <Reveal keyframes={fadeIn} delay={200} duration={1200} triggerOnce>
        <section className="categories container mt-10">
          <span className="title mb-1">Рекомендуем</span>

          <div className="row">
            {recProducts.map((item, index) => (
              <ALink key={index} className="col-xl-4 col-md-6 mb-4" href={`/${item.categoryHandle ? item.categoryHandle + '/' : ''}${item.seo?.seoUrl || '#'}`}>
                <div style={{ height: '100%' }}>
                  <div style={{ cursor: 'pointer', height: '100%' }} className="category category-group-image">
                    <figure className="category-media">
                      <Image
                        src={getImgPath(item.seo?.seoImage[0]?.imageName)}
                        style={{
                          height: '150px',
                          width: '100%',
                          objectFit: 'contain',
                          padding: '1rem',
                        }}
                        alt={item.seo?.seoImage[0]?.imageAlt || item.name}
                        title={item.seo?.seoTitle || item.name}
                        loading="lazy"
                        width={150}
                        height={150}
                      />
                    </figure>
                    <div className="category-content">
                      <span className="category-name">{item.name}</span>
                      <ul className="category-list">
                        <li>Бренд: {item.brand.name}</li>
                        {item.isStock ? <li style={{ color: 'var(--toastify-color-success)' }}>В наличии</li> : <li style={{ color: 'var(--toastify-color-error)' }}>Под заказ</li>}
                        <div className="spacer-div"></div>
                        <li>
                          {item.discount > 0 ? (
                            <span>
                              <span style={{ fontSize: '1.6rem', color: 'black', fontWeight: '500' }}>от</span>
                              <s>{item.price} BYN</s>
                              <br />
                              <span style={{ fontSize: '1.6rem', color: 'black', fontWeight: '500' }}> {item.totalPrice} BYN</span>
                            </span>
                          ) : (
                            <span>
                              <span style={{ fontSize: '1.6rem', color: 'black', fontWeight: '500' }}>от</span>
                              <span style={{ fontSize: '1.6rem', color: 'black', fontWeight: '500' }}> {item.totalPrice} BYN</span>
                              <br />
                              <br />
                            </span>
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </ALink>
            ))}
          </div>
        </section>
      </Reveal>
    )
  );
}
