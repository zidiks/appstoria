import React from "react";
import {getFieldsObject} from "~/utils/endpoints/fields";

Offer.getInitialProps = async (context) => {
  const fields = await getFieldsObject(
    'public-offer',
  );
  return { fields: fields };
}

export default function Offer ({ fields }) {
  return (
    <div className="container" style={{paddingTop: "2rem", paddingBottom: "2rem"}} dangerouslySetInnerHTML={{__html: fields['public-offer']}}></div>
  )
}
