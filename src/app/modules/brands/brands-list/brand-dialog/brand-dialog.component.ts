import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { BrandModel } from "../../../../shared/models/brand.model";
import { BrandsService } from "../../brands.service";
import { AddBrandDto, UpdateBrandDto } from "../../../../shared/dto/brands.dto";

@Component({
  selector: 'app-brand-dialog',
  templateUrl: './brand-dialog.component.html',
  styleUrls: ['./brand-dialog.component.scss']
})
export class BrandDialogComponent {
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    name : [ this.brandData?.name, Validators.required ],
    origin : [ this.brandData?.origin, Validators.required ],
    description : [ this.brandData?.description, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, BrandModel | undefined>,
    private formBuilder: FormBuilder,
    private brandsService: BrandsService,
  ) { }

  get brandData(): Partial<BrandModel> | undefined {
    return this.context.data;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.brandData?._id) {
        this.brandsService.updateBrand(this.brandData._id, this.formGroup.value as UpdateBrandDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      } else {
        this.brandsService.addBrand(this.formGroup.value as AddBrandDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

}
