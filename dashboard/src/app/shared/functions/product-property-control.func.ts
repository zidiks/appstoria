import { ProductTypePropertyType } from "../enums/product-property.enum";
import { FormControl, Validators } from "@angular/forms";
import { propertiesPrefabs } from "../constants/properties-prefabs.const";

export function productPropertyControl(propertyType: ProductTypePropertyType) {
  return new FormControl(propertiesPrefabs[propertyType].initialValue, Validators.required);
}
