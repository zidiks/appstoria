import YandexReviews from "~/components/common/partials/yandex-reviews";
import {getFieldsObject} from "~/utils/endpoints/fields";

ReviewsPage.getInitialProps = async () => {
  const fields = await getFieldsObject('yandex-reviews-org');
  return { fields: fields || {} };
};

export default function ReviewsPage({ fields }) {
  return (
    <div className="page-content">
      <YandexReviews orgId={fields?.['yandex-reviews-org']} />
    </div>
  )
}