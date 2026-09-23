import { ProductTypePropertyType } from "../enums/product-property.enum";
import { ProductTypePropertyDataModel } from "../models/product-type-property-data.model";

export const productsTypesPropertiesData: Record<ProductTypePropertyType, ProductTypePropertyDataModel> = {
  [ProductTypePropertyType.StringMultiSelect]: {
    name: 'Множественный строковый выбор',
    description: 'Можно задать для свойства несколько строковых значений из заранее созданного списка',
    options: true,
  },
  [ProductTypePropertyType.StringSelect]: {
    name: 'Строковый выбор',
    description: 'Можно задать для свойства одно строковое значение из заранее созданного списка',
    options: true,
  },
  [ProductTypePropertyType.StringInput]: {
    name: 'Произвольная строка',
    description: 'Можно задать для свойства произвольное строковое значение',
  },
  [ProductTypePropertyType.NumberInput]: {
    name: 'Произвольное число',
    description: 'Можно задать для свойства произвольное числовое значение',
  },
  [ProductTypePropertyType.NumberSelect]: {
    name: 'Числовой выбор',
    description: 'Можно задать для свойства одно числовое значение из заранее созданного списка',
    options: true,
  },
  [ProductTypePropertyType.CheckBox]: {
    name: 'Флаг',
    description: 'Можно задать для свойства одно логическое значение (верно/неверно)',
  },
  [ProductTypePropertyType.Color]: {
    name: 'Цвет',
    description: 'Можно задать для свойства цвет с помощью специального диалогового окна',
  },
}
