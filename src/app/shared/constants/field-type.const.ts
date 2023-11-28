import { FieldType } from "../enums/field-type.enum";
import { FieldTypeDataModel } from "../models/field-type-data.model";

export const fieldTypeData: Record<FieldType, FieldTypeDataModel> = {
  [FieldType.FieldString]: {
    name: 'Строковое значение',
    description: 'Можно задать одно строковое значение',
  },
  [FieldType.FieldStringArray]: {
    name: 'Множество строк',
    description: 'Можно задать несколько строковых значений',
  },
  [FieldType.FieldContent]: {
    name: 'Форматированный текст',
    description: 'Можно разместить длинный форматированный текст',
  },
}
