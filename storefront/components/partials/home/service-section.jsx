import React from "react";
import InlineSVG from "react-inlinesvg";
import {servicesIcons} from "~/utils/data/services-icons";

function ServiceBox({fields}) {
  const services = Object.values(fields);

  return (
    <section className="container">
      <div className="services-section-wrapper">
        {services.map((feature, index) => (
          <div key={index} className="services-section-item">
            <InlineSVG className="services-icon" src={servicesIcons[feature.split("||")[1]?.trim()]?.src}/>
            <span className="services-section-item-text">{feature.split("||")[0]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(ServiceBox);
