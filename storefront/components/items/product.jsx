import React, {useEffect, useRef, useState} from 'react';

import ALink from '~/components/features/custom-link';
import MediaFive from '~/components/partials/product/media/media-five';
import DetailThree from '~/components/partials/product/detail/detail-three';
import DescOne from '~/components/partials/product/desc/desc-one';
import ProductSidebar from '~/components/partials/product/product-sidebar';
import {getImgPath, pushToDataLayer, toDecimal} from '~/utils';
import Modal from 'react-modal';
import 'react-phone-number-input/style.css';
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input';
import ru from '~/public/labels/ru';
import {sendMessage} from '~/utils/endpoints/message';
import Head from 'next/head';
import InlineSVG from "react-inlinesvg";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import {homeOutlineIcon} from "~/icons/home-outline";
import TurnstileWidget from '~/components/features/turnstile';
import FormStatus from '~/components/features/form-status';
import {getPublicFormErrorMessage} from '~/utils/endpoints/public-form';
import {SITE_NAME, SITE_URL} from '~/utils/site';

const INSTALLMENT_TERMS = [3, 6, 12, 18];
const MAX_DOWN_PAYMENT = 99;

// Имя и фамилия: минимум два слова из букв (дефис и апостроф — для двойных фамилий)
const isValidFullName = (value) => /^[\p{L}'’-]{2,}(\s+[\p{L}'’-]{2,})+$/u.test(value.trim());

const parseDownPayment = (value) => {
  if (!/^\d{1,2}$/.test(value.trim())) return null;
  const percent = Number(value);
  return percent <= MAX_DOWN_PAYMENT ? percent : null;
};

export default function ProductItem({product, featured, deliveryMethods, seoFields, mainSeo}) {
  if (!product) return '';
  const modalStyles = {
    content: {
      position: 'relative',
    },
    overlay: {
      background: 'rgba(0,0,0,.4)',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
    },
  };

  const ogImage = product.seo?.seoImage[0];
  const descriptionString = `${product.seo?.seoTitle || product.name || ''}`;
  const categoryString = `${product.category.name}`;
  const headerString = `${product.name}`;
  const [modalState, setModalState] = useState(false);
  const [phoneValue, setPhoneValue] = useState('+375');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fastFormDone, setFastFormDone] = useState(false);
  const [selectedAdditionals, setSelectedAdditionals] = useState([]);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [termValue, setTermValue] = useState(null);
  const [downPaymentValue, setDownPaymentValue] = useState('');
  const [downPaymentTouched, setDownPaymentTouched] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formStatus, setFormStatus] = useState(null);
  const turnstileRef = useRef(null);
  const turnstileEnabled = Boolean(process.env.TURNSTILE_SITE_KEY);
  const phoneValid = Boolean(phoneValue && isValidPhoneNumber(phoneValue));
  const nameValid = isValidFullName(nameValue);
  const downPayment = parseDownPayment(downPaymentValue);
  const downPaymentValid = downPayment !== null;
  const installmentValid = nameValid && phoneValid && Boolean(termValue) && downPaymentValid;
  const captchaReady = !turnstileEnabled || Boolean(turnstileToken);

  // Свой SEO-заголовок товара уже полный — шаблон нужен только товарам без него
  const interpolatedTitle = mainSeo?.title || product.seo?.seoTitle || seoFields['product-seo-title'].replaceAll('{TITLE}', product.name || SITE_NAME);
  const interpolatedDescription = mainSeo?.description || seoFields['product-seo-description'].replaceAll('{TITLE}', descriptionString).replaceAll('{CATEGORY}', categoryString);
  const interpolatedHeader = mainSeo?.tag || seoFields['product-seo-header'].replaceAll('{TITLE}', headerString);

  function resetInstallmentFields() {
    setNameValue('');
    setNameTouched(false);
    setTermValue(null);
    setDownPaymentValue('');
    setDownPaymentTouched(false);
  }

  function closeModal() {
    document.querySelector('.ReactModal__Overlay.newsletter-modal-overlay').classList.add('removed');
    document.querySelector('.newsletter-popup.ReactModal__Content').classList.remove('ReactModal__Content--after-open');
    setFastFormDone(false);
    setIsSubmitting(false);
    setModalState(false);
    setCheckboxValue(false);
    setPhoneValue('+375');
    setPhoneTouched(false);
    resetInstallmentFields();
    setFormStatus(null);
    setTurnstileToken('');
    turnstileRef.current?.reset();
  }

  function handleCheckboxChange(event) {
    setCheckboxValue(event.target.checked);
  }

  const submitHandler = (e) => {
    e.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setDownPaymentTouched(true);
    if (!installmentValid || !captchaReady) {
      let message = 'Дождитесь загрузки и завершите проверку безопасности.';
      if (!nameValid) message = 'Укажите имя и фамилию.';
      else if (!phoneValid) message = 'Введите корректный номер телефона.';
      else if (!termValue) message = 'Выберите срок рассрочки.';
      else if (!downPaymentValid) message = `Укажите первоначальный взнос от 0 до ${MAX_DOWN_PAYMENT}%.`;
      setFormStatus({type: 'error', message});
      return;
    }

    const form = e.target;
    const formData = {
      ...Object.values(form).reduce((obj, field) => {
        obj[field.name] = field.value;
        return obj;
      }, {}),
      product: product.name,
    };
    setIsSubmitting(true);
    setFormStatus({type: 'loading', message: 'Отправляем заявку…'});
    try {
      if (product) {
        const items = [{
          item_name: product.name || '',
          item_id: product._id,
          price: product.totalPrice || product.price || 0,
          item_brand: product.brand?.name || '',
          item_category: categoryString,
          quantity: 1
        }]
        const ymItems = [{
          id: product._id,
          name: product.name || '',
          price: product.totalPrice || product.price || 0,
          brand: product.brand?.name || '',
          category: categoryString,
          quantity: 1
        }]

        pushToDataLayer({
          event: 'purchase',
          ecommerce: {
            items,
            value: product?.totalPrice || product?.price || 0,
            currency: 'BYN',
            affiliation: 'cart',
            tax: 0,
            currencyCode: "BYN",
            purchase: {
              actionField: {
                revenue: product?.totalPrice || product?.price || 0,
                shipping: 0,
                tax: 0,
              },
              products: ymItems,
            }
          },
        });
      }
    } catch (e) {
      console.log(e)
    }
    sendMessage({
      name: nameValue.trim().replace(/\s+/g, ' '),
      phone: phoneValue,
      message: [
        '[Рассрочка]:',
        product.name,
        ...(selectedAdditionals || []).map(item => item.name),
        `Срок рассрочки: ${termValue} мес.`,
        `Первоначальный взнос: ${downPayment}%`,
      ].join('\n'),
      website: formData?.website || '',
      turnstileToken,
    })
      .then(() => {
        setFastFormDone(true);
        setSelectedAdditionals([]);
        document.getElementById('fast-form')?.reset();
        setPhoneValue('+375');
        setPhoneTouched(false);
        resetInstallmentFields();
        turnstileRef.current?.reset();
        setTurnstileToken('');
      })
      .catch((e) => {
        setFormStatus({type: 'error', message: getPublicFormErrorMessage(e)});
        turnstileRef.current?.reset();
        setTurnstileToken('');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    if (!!product) {
      const items = [{
        item_name: product.name || '',
        item_id: product._id,
        price: product.totalPrice || product.price || 0,
        item_brand: product.brand?.name || '',
        item_category: product.category?.name || '',
        quantity: 1
      }]
      const ymItems = [{
        id: product._id,
        name: product.name || '',
        price: product.totalPrice || product.price || 0,
        brand: product.brand?.name || '',
        category: product.category?.name || '',
        quantity: 1
      }]

      pushToDataLayer({
        event: 'view_item',
        ecommerce: {
          items,
          currencyCode: "BYN",
          detail: {
            products: ymItems
          }
        },
      });
    }
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product?.name,
    'image': ogImage && getImgPath(ogImage.imageName),
    'description': interpolatedDescription,
    'offers': {
      '@type': 'Offer',
      'url': product && `${SITE_URL}/${product.category?.handle ? product.category?.handle + '/' : ''}${product.seo?.seoUrl || '#'}`,
      'price': product?.totalPrice || product?.price,
      'priceCurrency': 'BYN',
      'availability': 'https://schema.org/InStock',
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME
      },
    }
  };

  return (
    <main className="main single-product">
      <Head>
        <title>{interpolatedTitle}</title>
        <meta property="og:title" content={interpolatedTitle}/>
        <meta name="description" content={interpolatedDescription}/>
        <meta property="og:description" content={interpolatedDescription}/>
        <meta name="keywords" content={mainSeo?.keywords || product.seo?.seoKeywords?.join(', ')}/>
        {ogImage && <meta property="og:image" content={getImgPath(ogImage.imageName)}/>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}/>
      </Head>

      {!!product ? (
        <div className={`page-content mb-8`}>
          <div className="container skeleton-body">
            <div className="product-navigation">
              <ul className="breadcrumb breadcrumb-sm">
                <li>
                  <ALink href="/">
                    <InlineSVG className="icon-16" src={homeOutlineIcon}/>
                  </ALink>
                  <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
                </li>
                <li>
                  <ALink className="categories-link-desktop" href="/shop">
                    Каталог
                  </ALink>
                  <ALink className="categories-link-mobile" href="/categories">
                    Каталог
                  </ALink>
                  <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
                </li>
                <li>
                  <ALink href={`/${product.category.handle}/`} className="active">
                    {product.category.name}
                  </ALink>
                  <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
                </li>
                {product.name && <li>
                  <span className="breadcrumb-latest">{product.name}</span>
                </li>}
              </ul>
            </div>

            <div className="row gutter-lg">
              <ProductSidebar featured={featured?.data || []} deliveryMethods={deliveryMethods || []}/>

              <div className="col-lg-9">
                <div className="product product-single row">
                  <div className="col-md-6">
                    <MediaFive product={product} adClass="pb-0"/>
                  </div>

                  <div className="col-md-6">
                    <DetailThree
                      openModal={setModalState}
                      productName={interpolatedHeader}
                      product={product}
                      isNav={false}
                      selectedAdditionals={selectedAdditionals}
                      setSelectedAdditionals={setSelectedAdditionals}
                    />
                  </div>
                </div>

                <DescOne mainSeo={mainSeo} product={product} isDivider={false} className="mt-2 m-4" isGuide={false}/>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
      <Modal isOpen={modalState} style={modalStyles} onRequestClose={closeModal} shouldReturnFocusAfterClose={false}
             overlayClassName="newsletter-modal-overlay" className="newsletter-popup bg-img">
        <div className="newsletter-popup" id="newsletter-popup">
          <div className="newsletter-content">
            <span className="newsletter-content_title">Оформить в рассрочку</span>
            <p className="text-grey">{product.name}</p>
            {(selectedAdditionals || []).map((additional, index) => (
              <p key={index} className="text-grey">{additional.name}</p>
            ))}
            {fastFormDone ? (
              <div className="mr-auto ml-auto">
                <div>
                  <div>
                    <svg className="fast-done_icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50"
                         enableBackground="new 0 0 50 50" xmlSpace="preserve">
                      <g>
                        <path
                          fill="none"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="bevel"
                          strokeMiterlimit="10"
                          d="
                                        M33.3,3.9c-2.7-1.1-5.6-1.8-8.7-1.8c-12.3,0-22.4,10-22.4,22.4c0,12.3,10,22.4,22.4,22.4c12.3,0,22.4-10,22.4-22.4
                                        c0-0.7,0-1.4-0.1-2.1"
                        ></path>
                        <polyline
                          fill="none"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="bevel"
                          strokeMiterlimit="10"
                          points="
                                        48,6.9 24.4,29.8 17.2,22.3 	"
                        ></polyline>
                      </g>
                    </svg>
                  </div>
                  <div>
                    <div>
                      <span className="fast-done_title">Успешно оформлено!</span>
                    </div>
                    <div>
                      <span>Менеджер свяжется с вами для оформления рассрочки</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form id="fast-form" onSubmit={submitHandler}>
                <input type="text" name="website" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
                <div className="input-wrapper input-wrapper-inline input-wrapper-round" style={{marginBottom:'2px'}}>
                  <input
                    type="text"
                    className="form-control name"
                    name="name"
                    placeholder="Имя и фамилия"
                    autoComplete="name"
                    value={nameValue}
                    onBlur={() => setNameTouched(true)}
                    onChange={(e) => setNameValue(e.target.value)}
                  />
                </div>
                <p
                  className={`fast-phone-error ${nameTouched && !nameValid ? 'visible' : ''}`}
                  aria-live="polite"
                >
                  Укажите имя и фамилию.
                </p>
                <div className="input-wrapper input-wrapper-inline input-wrapper-round" style={{marginBottom:'2px'}}>
                  <PhoneInput
                    labels={ru}
                    placeholder="Номер телефона"
                    defaultCountry="BY"
                    className="form-control phone"
                    value={phoneValue}
                    onBlur={() => setPhoneTouched(true)}
                    onChange={setPhoneValue}
                  />
                </div>
                <p
                  className={`fast-phone-error ${phoneTouched && !phoneValid ? 'visible' : ''}`}
                  aria-live="polite"
                >
                  Введите корректный номер телефона.
                </p>
                <div className="installment-field" role="radiogroup" aria-labelledby="installment-term-label">
                  <span className="installment-field_label" id="installment-term-label">Срок рассрочки</span>
                  <div className="installment-terms">
                    {INSTALLMENT_TERMS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        role="radio"
                        aria-checked={termValue === term}
                        className={`installment-term ${termValue === term ? 'active' : ''}`}
                        onClick={() => setTermValue(term)}
                      >
                        {term} мес.
                      </button>
                    ))}
                  </div>
                </div>
                <div className="installment-field installment-field-last">
                  <label className="installment-field_label" htmlFor="installment-down-payment">
                    Первоначальный взнос
                  </label>
                  <div className="installment-percent">
                    <input
                      type="text"
                      inputMode="numeric"
                      id="installment-down-payment"
                      className="form-control"
                      name="downPayment"
                      placeholder="0"
                      value={downPaymentValue}
                      onBlur={() => setDownPaymentTouched(true)}
                      onChange={(e) => setDownPaymentValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    />
                    <span className="installment-percent_suffix">%</span>
                  </div>
                </div>
                <p
                  className={`fast-phone-error installment-error ${downPaymentTouched && !downPaymentValid ? 'visible' : ''}`}
                  aria-live="polite"
                >
                  Укажите взнос от 0 до {MAX_DOWN_PAYMENT}%.
                </p>
                <div className="form-checkbox justify-content-center">
                  <input type="checkbox" value={checkboxValue} onChange={handleCheckboxChange}
                         className="custom-checkbox" id="hide-newsletter-popup" name="agreement" required/>
                  <label htmlFor="hide-newsletter-popup">
                    Я прочитал(а){' '}
                    <ALink href="/pages/privacy/">
                      <u>правила обработки персональных данных</u>
                    </ALink>{' '}
                    и соглашаюсь на обработку персональных данных *
                  </label>
                </div>
                <TurnstileWidget
                  ref={turnstileRef}
                  className="mb-4"
                  onToken={setTurnstileToken}
                />
                <FormStatus type={formStatus?.type} message={formStatus?.message} />
                <button
                  type="submit"
                  className="btn btn-dark btn-rounded"
                  disabled={!checkboxValue || !installmentValid || !captchaReady || isSubmitting}
                >
                  Отправить
                </button>
              </form>
            )}
          </div>
          <button title="Close (Esc)" type="button" className="mfp-close" onClick={closeModal}>
            <span>×</span>
          </button>
        </div>
      </Modal>
    </main>
  );
}
