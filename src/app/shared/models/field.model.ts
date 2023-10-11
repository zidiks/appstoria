import { ApiId } from "./api-data.model";
import { FieldType } from "../enums/field-type.enum";

export interface FieldModel extends ApiId {
  code: string;
  type: FieldType;
  label: string;
  value: string | string[];
}
