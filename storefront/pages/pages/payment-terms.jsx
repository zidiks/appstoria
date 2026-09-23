import React from "react";
import {getFieldsObject} from "~/utils/endpoints/fields";

PaymentTerms.getInitialProps = async (context) => {
  const fields = await getFieldsObject(
    'payment-terms',
  );
  return { fields: fields };
}

export default function PaymentTerms ({ fields }) {
  return (
    <div className="container" style={{paddingTop: "2rem", paddingBottom: "2rem"}} dangerouslySetInnerHTML={{__html: fields['payment-terms']}}></div>
  )
}
