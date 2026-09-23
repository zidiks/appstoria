import { TuiValidationError } from "@taiga-ui/cdk";
import { AbstractControl, ValidatorFn } from "@angular/forms";

export function maxFilesLength(maxLength: number): ValidatorFn {
  return ({value}: AbstractControl) => {
    if (!value) {
      return null;
    }
    return value.length > maxLength
      ? {
        maxLength: new TuiValidationError(
          `Error: maximum limit - 5 files for upload`,
        ),
      }
      : null;
  };
}
