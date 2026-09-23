import React from "react";
import {getFieldsObject} from "~/utils/endpoints/fields";

DeliveryTerms.getInitialProps = async (context) => {
  const fields = await getFieldsObject(
    'delivery-terms',
  );
  return { fields: fields };
}

export default function DeliveryTerms ({ fields }) {
  return (
    <div className="container" style={{paddingTop: "2rem", paddingBottom: "2rem"}} dangerouslySetInnerHTML={{__html: fields['delivery-terms']}}></div>
  )
}
