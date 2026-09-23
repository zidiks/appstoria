import {useEffect, useState} from "react";
import {useDebounce} from "~/utils";

export default function CustomPriceInput({ min, max, postfix, onChange }) {
  const [priceRange, setPriceRange] = useState({
    min: min || '',
    max: max || '',
  });
  const debouncedPriceRange = useDebounce(priceRange, 400);

  useEffect(() => {
    if (onChange) onChange(debouncedPriceRange);
  }, [debouncedPriceRange]);

  function onInputChangeFrom(e) {
    setPriceRange({
      min: e.target.value || '',
      max: priceRange.max || '',
    });
  }

  function onInputChangeTo(e) {
    setPriceRange({
      min: priceRange.min || '',
      max: e.target.value || '',
    });
  }

  return (
    <div className="row">
      <div className="col-xs-6">
        <label>От</label>
        <div datapostfix={postfix} className="widget-input-number">
          <input onChange={onInputChangeFrom} value={priceRange.min || ''} className="form-control" type="number" />
        </div>
      </div>
      <div className="col-xs-6">
        <label>До</label>
        <div datapostfix={postfix} className="widget-input-number">
          <input onChange={onInputChangeTo} value={priceRange.max || ''} className="form-control" type="number" />
        </div>
      </div>
    </div>
  )
}