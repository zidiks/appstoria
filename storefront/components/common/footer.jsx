import ALink from '~/components/features/custom-link';
import { orderCategories } from '~/utils';
import Image from 'next/image';
import paymentsImage from '~/public/images/payment.png';
import InlineSVG from "react-inlinesvg";
import {telegramIcon} from "~/icons/telegram";
import {viberIcon} from "~/icons/viber";
import {instagramIcon} from "~/icons/instagram";
import {whatsappIcon} from "~/icons/whatsapp";
import { SITE_NAME } from '~/utils/site';

export default function Footer({ fields, categoryTree, footerNav }) {
  const YEAR = new Date().getFullYear();
  const copyright = fields.copyright || `${SITE_NAME} © ${YEAR}. Все права защищены.`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">

        </div>

        <div className="footer-middle">
          <div className="row justify-content-between">
            <div className="col-lg-3 col-md-6">
              <ALink href="/" className="logo-footer mb-4">
                <img src="/images/logo.svg" alt={SITE_NAME} title={SITE_NAME} width={149} height={32} />
              </ALink>

              <div className="widget widget-info">
                <span className="widget-title">Контакты</span>

                <ul className="widget-body">
                  <li>
                    <label>Телефон: </label>
                    <ALink href={`tel:${fields.phone}`}>{fields.phone}</ALink>
                  </li>
                  <li>
                    <label>Email: </label>
                    <ALink href={`mailto:${fields.email}`}>{fields.email}</ALink>
                  </li>
                  <li>
                    <label>Адрес: </label>
                    <a rel="nofollow" href={`http://maps.google.com/?q=${fields.address}`} target="_blank">
                      {fields.address}
                    </a>
                  </li>
                  <li>
                    <label>Рабочее время: </label>
                  </li>
                  <li>
                    <ALink href="#">{fields.work_time}</ALink>
                  </li>
                  <li>
                    <label>Реквизиты компании: </label>
                  </li>
                  <li>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{fields.legal}</div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <div className="widget ml-lg-4">
                <span className="widget-title">Информация</span>
                <ul className="widget-body">
                  {footerNav.children.length
                    ? footerNav.children.map((item) => (
                        <li key={item._id}>
                          <ALink href={item.handle}>{item.name}</ALink>
                        </li>
                      ))
                    : ''}
                </ul>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <div className="widget ml-lg-4">
                <span className="widget-title">Категории</span>
                <ul className="widget-body">
                  {categoryTree.sort(orderCategories).map((item, index) => (
                    <li key={index}>
                      <ALink href={`/${item.handle}`}>{item.name}</ALink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-left">
            <figure className="payment">
              <Image src={paymentsImage} alt="payment" title="payment" width={336} height={29} />
            </figure>
          </div>
          <div className="footer-center">
            <p className="copyright" style={{ whiteSpace: 'pre-wrap' }}>{copyright}</p>
          </div>
          <div className="footer-right">
            <div className="social-links">
              {fields.telegram && <ALink rel="nofollow" href={fields.telegram} className="social-link social-link-footer social-telegram">
                <InlineSVG className="social-link-icon" src={telegramIcon} />
              </ALink>}
              {fields.viber && <ALink rel="nofollow" href={`viber://chat?number=${fields.viber}`} className="social-link social-link-footer social-viber">
                <InlineSVG className="social-link-icon" src={viberIcon} />
              </ALink>}
              {fields.whatsapp && <ALink rel="nofollow" href={fields.whatsapp} className="social-link social-link-header social-whatsapp">
                <InlineSVG className="social-link-icon" src={whatsappIcon} />
              </ALink>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
