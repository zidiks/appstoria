import { ProductTypePropertyType } from "../enums/product-property.enum";
import { PropertyPrefabModel } from "../models/property-prefab.model";

export const propertiesPrefabs: Record<ProductTypePropertyType, PropertyPrefabModel> = {
  [ProductTypePropertyType.StringMultiSelect]: {
    initialValue: [],
  },
  [ProductTypePropertyType.StringSelect]: {
    initialValue: null,
  },
  [ProductTypePropertyType.StringInput]: {
    initialValue: '',
  },
  [ProductTypePropertyType.NumberInput]: {
    initialValue: null,
  },
  [ProductTypePropertyType.NumberSelect]: {
    initialValue: null,
  },
  [ProductTypePropertyType.CheckBox]: {
    initialValue: false,
  },
  [ProductTypePropertyType.Color]: {
    initialValue: '#000000',
  },
}
