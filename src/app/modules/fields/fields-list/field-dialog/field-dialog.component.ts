import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { FieldsService } from "../../fields.service";
import { FieldModel } from "../../../../shared/models/field.model";

@Component({
  selector: 'app-field-dialog',
  templateUrl: './field-dialog.component.html',
  styleUrls: ['./field-dialog.component.scss']
})
export class FieldDialogComponent {
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    label: [ this.fieldData?.label, Validators.required ],
    code : [ this.fieldData?.code, Validators.required ],
    type : [ this.fieldData?.type, Validators.required ],
    value : [ this.fieldData?.value, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, FieldModel | undefined>,
    private formBuilder: FormBuilder,
    private brandsService: FieldsService,
  ) { }

  get fieldData(): Partial<FieldModel> | undefined {
    return this.context.data;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      this.brandsService.setField(this.formGroup.value as Partial<FieldModel>).subscribe(
        res => this.context.completeWith(res),
        err => this.context.completeWith(null),
      );
    } else {
      this.formGroup.markAsTouched();
    }
  }

}
