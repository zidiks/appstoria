import { Pipe, PipeTransform } from '@angular/core';
import { FieldTypeDataModel } from "../../models/field-type-data.model";
import { FieldType } from "../../enums/field-type.enum";
import { fieldTypeData } from "../../constants/field-type.const";

@Pipe({
  name: 'fieldType'
})
export class FieldTypePipe implements PipeTransform {

  transform(value: string): FieldTypeDataModel | undefined {
    if (Object.values(FieldType).includes(value as FieldType)) {
      return fieldTypeData[value as FieldType];
    }
    return undefined;
  }

}
