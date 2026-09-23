import React, { useRef, useState } from 'react';
import Reveal from 'react-awesome-reveal';

import ALink from '~/components/features/custom-link';
import { fadeIn } from '~/utils/data/keyframes';

import { getFieldsObject } from '~/utils/endpoints/fields';
import { sendMessage } from '~/utils/endpoints/message';
import Head from 'next/head';
import InlineSVG from "react-inlinesvg";
import {homeOutlineIcon} from "~/icons/home-outline";
import {chevronForwardOutlineIcon} from "~/icons/chevron-forward-outline";
import PhoneInput, {isValidPhoneNumber} from 'react-phone-number-input';
import ru from '~/public/labels/ru';
import TurnstileWidget from '~/components/features/turnstile';
import {getPublicFormErrorMessage} from '~/utils/endpoints/public-form';
import FormStatus from '~/components/features/form-status';

ContactUs.getInitialProps = async () => {
  const fields = await getFieldsObject('phone', 'email', 'address');
  return {
    fields: fields,
  };
};

export default function ContactUs({ fields }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneValue, setPhoneValue] = useState('+375');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formStatus, setFormStatus] = useState(null);
  const turnstileRef = useRef(null);
  const turnstileEnabled = Boolean(process.env.TURNSTILE_SITE_KEY);
  const phoneValid = Boolean(phoneValue && isValidPhoneNumber(phoneValue));
  const captchaReady = !turnstileEnabled || Boolean(turnstileToken);

  const submitHandler = (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!phoneValid || !captchaReady) {
      setFormStatus({
        type: 'error',
        message: !phoneValid
          ? 'Введите корректный номер телефона.'
          : 'Дождитесь загрузки и завершите проверку безопасности.',
      });
      return;
    }

    const form = e.target;
    const formData = Object.values(form).reduce((obj, field) => {
      obj[field.name] = field.value;
      return obj;
    }, {});
    setIsSubmitting(true);
    setFormStatus({type: 'loading', message: 'Отправляем сообщение…'});
    sendMessage({
      name: formData?.name || 'Неизвестно',
      phone: phoneValue,
      message: formData?.message || 'Неизвестно',
      website: formData?.website || '',
      turnstileToken,
    })
      .then(() => {
        setFormStatus({type: 'success', message: 'Сообщение успешно отправлено.'});
        document.getElementById('contact-form').reset();
        setPhoneValue('+375');
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

  return (
    <main className="main contact-us">
      <Head>
        <title>Mac Plus | Контакты</title>
      </Head>

      <h1 className="d-none">Mac Plus - Контакты</h1>

      <nav className="breadcrumb-nav">
        <div className="container">
          <ul className="breadcrumb breadcrumb-sm">
            <li>
              <ALink href="/">
                <InlineSVG className="icon-16" src={homeOutlineIcon}/>
              </ALink>
              <InlineSVG className="breadcrumb-arrow" src={chevronForwardOutlineIcon}/>
            </li>
            <li>
              <span className="active">
                Контакты
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <div className="page-header"
           style={{backgroundImage: 'url(./images/page-header/contact-us.png)', backgroundColor: '#92918f'}}>
        <h1 className="page-title font-weight-bold text-capitalize ls-l">Контакты</h1>
      </div>

      <div className="page-content mt-10 pt-7">
        <Reveal keyframes={fadeIn} delay="50" duration="1000" triggerOnce>
          <section className="contact-section">
            <div className="container">
              <div className="row">
                <div className="col-lg-3 col-md-4 col-sm-6 ls-m mb-4">
                  <div className="grey-section d-flex align-items-center h-100">
                    <div>
                      <h4 className="mb-2 text-capitalize">Адрес</h4>
                      <p>
                        <a rel="nofollow" href={`http://maps.google.com/?q=${fields.address}`} target="_blank">
                          {fields.address}
                        </a>
                      </p>

                      <h4 className="mb-2 text-capitalize">Телефон</h4>
                      <p>
                        <ALink href={`tel:${fields.phone}`}>{fields.phone}</ALink>
                      </p>

                      <h4 className="mb-2 text-capitalize">Почта</h4>
                      <p className="mb-4">
                        <ALink href={`mailto:${fields.email}`}>{fields.email}</ALink>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-9 col-md-8 col-sm-6 d-flex align-items-center mb-4">
                  <div className="w-100">
                    <form id="contact-form" className="pl-lg-2" onSubmit={submitHandler}>
                      <input type="text" name="website" tabIndex="-1" autoComplete="off" style={{ display: 'none' }} />
                      <h4 className="ls-m font-weight-bold">Напишите нам</h4>
                      <p>Ваш электронный адрес не будет передан третьим лицам. Обязательные поля помечены *</p>
                      <div className="row mb-2">
                        <div className="col-12 mb-4">
                          <textarea name="message" className="form-control" required placeholder="Комментарий *"></textarea>
                        </div>
                        <div className="col-md-6 mb-4">
                          <input className="form-control" name="name" type="text" placeholder="Имя *" required />
                        </div>
                        <div className="col-md-6 mb-4">
                          <PhoneInput
                            defaultCountry="BY"
                            labels={ru}
                            className="form-control"
                            placeholder="Телефон *"
                            value={phoneValue}
                            onBlur={() => setPhoneTouched(true)}
                            onChange={setPhoneValue}
                          />
                          {phoneTouched && !phoneValid ? (
                            <p className="checkout-error-message">Введите корректный номер телефона.</p>
                          ) : ''}
                        </div>
                      </div>
                      <TurnstileWidget
                        ref={turnstileRef}
                        className="mb-4"
                        onToken={setTurnstileToken}
                      />
                      <FormStatus type={formStatus?.type} message={formStatus?.message} />
                      <button
                        className="btn btn-dark btn-rounded"
                        disabled={!phoneValid || !captchaReady || isSubmitting}
                      >
                        Отправить
                        <i className="d-icon-arrow-right"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
