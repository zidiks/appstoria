import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { FieldsService } from "../../fields.service";
import { FieldModel } from "../../../../shared/models/field.model";
import { fieldTypeData } from "../../../../shared/constants/field-type.const";
import { FieldTypeDataModel } from "../../../../shared/models/field-type-data.model";
import { TuiContextWithImplicit, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { ProductTypePrevModel } from "../../../../shared/models/type-property.model";
import { FieldType } from "../../../../shared/enums/field-type.enum";

interface FieldTypeItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-field-dialog',
  templateUrl: './field-dialog.component.html',
  styleUrls: ['./field-dialog.component.scss']
})
export class FieldDialogComponent implements OnInit {
  public loading = false;
  public fieldTypes: FieldTypeItem[] = Object.entries(fieldTypeData).map(([key, value]: [string, FieldTypeDataModel]) => {
    return {
      label: value.name,
      value: key,
    }
  });
  public fieldTypeEnum = FieldType;

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

  public ngOnInit(): void {
    this.f['type'].valueChanges.subscribe(() => {
      this.f['value'].reset();
    })
  }

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

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  @tuiPure
  public stringify(
    items: FieldTypeItem[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({value, label}) => [value, label] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

}
