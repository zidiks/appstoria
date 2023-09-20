import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import {
  EMPTY_ARRAY,
  TuiBooleanHandler,
  TuiContextWithImplicit,
  tuiPure,
  TuiStringHandler,
  TuiValidationError
} from "@taiga-ui/cdk";
import {
  ProductTypePropertyDataModel,
  ProductTypePropertyItemModel
} from "../../../shared/models/product-type-property-data.model";
import { ProductTypePropertyType } from "../../../shared/enums/product-property.enum";
import { productsTypesPropertiesData } from "../../../shared/constants/product-type-property.const";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ProductTypePropertyModel } from "../../../shared/models/type-property.model";
import { PropertiesService } from "../properties.service";
import { pairwise } from "rxjs";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";

@Component({
  selector: 'app-properties-details',
  templateUrl: './properties-details.component.html',
  styleUrls: ['./properties-details.component.scss']
})
export class PropertiesDetailsComponent implements OnInit {
  public breadcrumbs;
  public propertyId;
  public typesList: ProductTypePropertyItemModel[] = this.productTypePropertyTypes;
  public propertyData: ApiDataModel<ProductTypePropertyModel>;
  public productTypePropertyType = ProductTypePropertyType;
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group({
    name: [``, Validators.required],
    description: [null],
    showCard: [false],
    showFilter: [false],
    type: [null, Validators.required],
    units: [null],
    options: [ [] ],
  });

  constructor(
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private propertiesService: PropertiesService,
  ) {
    this.propertyId = this.route.snapshot.params['id'];
    this.breadcrumbs = [
      {
        caption: `Главная`,
        routerLink: `/`,
      },
      {
        caption: `Свойства`,
        routerLink: `/properties`,
      },
      {
        caption: `${!this.propertyId ? 'Новое свойство' : 'Детали'}`,
        routerLink: `/properties/details/${this.propertyId}`,
      }
    ];
  }

  private createControlValidator(handler: TuiBooleanHandler<string>): ValidatorFn {
    return ({value}: AbstractControl<any[]>) => {
      const invalidTags = value ? value.filter((item: any) => !handler(item)) : EMPTY_ARRAY;
      return invalidTags.length > 0
        ? {
          tags: new TuiValidationError(`Some tags are invalid`),
        }
        : null;
    };
  }

  public tagDigitsValidator(tag: string): boolean {
    return /\d/.test(tag);
  }

  public tagWordsValidator(tag: string): boolean {
    return true;
  }

  public ngOnInit(): void {
    this.f['type'].valueChanges.pipe(pairwise()).subscribe(([prev, next]: [ProductTypePropertyType, ProductTypePropertyType]) => {
      this.f['units'].reset();
      if (ProductTypePropertyType.NumberSelect === next) {
        this.f['options'].clearValidators();
        this.f['options'].setValidators(this.createControlValidator(this.tagDigitsValidator));
      } else {
        this.f['options'].clearValidators();
        this.f['options'].setValidators(this.createControlValidator(this.tagWordsValidator));
      }
      if (!productsTypesPropertiesData[next]?.options && productsTypesPropertiesData[prev]?.options) {
        this.f['options'].patchValue([]);
      }
    });
    if (this.propertyId) {
      this.refreshData();
    } else {
      this.propertyData = null;
    }
  }

  public refreshData(): void {
    if (this.propertyId) {
      this.propertyData = undefined;
      this.formGroup.reset();
      this.propertiesService.getPropertyById(this.propertyId).subscribe((res: ProductTypePropertyModel) => {
        this.propertyData = res || null;
        if (res) {
          setTimeout(() => {
            this.formGroup.patchValue({
              name: res.name,
              description: res.description,
              showCard: res.showCard,
              showFilter: res.showFilter,
              type: res.type,
              options: res.options || [],
              units: res.units || undefined,
            });
          });
        }
      });
    }
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  private get productTypePropertyTypes(): ProductTypePropertyItemModel[] {
    return Object.entries(productsTypesPropertiesData).map(([key, value]: [string, ProductTypePropertyDataModel]) => {
      return {
        key: key as ProductTypePropertyType,
        ...value,
      }
    })
  }

  @tuiPure
  public stringify(
    items: ProductTypePropertyItemModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({key, name}) => [key.toString(), name] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  public submit(): void {
    this.formGroup.markAsTouched();
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.propertyId) {
        this.propertiesService.updateProperty(this.propertyId, this.formGroup.value).subscribe(
          res => {
            if (res) {
              this.alertService.open(`Свойство ${res.name} обновлено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.router.navigate(['/properties/list']);
            }
          },
          err => {
            this.loading = false;
          }
        )
      } else {
        this.propertiesService.addProperty(this.formGroup.value).subscribe(
          res => {
            if (res) {
              this.alertService.open(`Свойство ${res.name} добавлено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.router.navigate(['/properties/list']);
            }
          },
          err => {
            this.loading = false;
          }
        )
      }
    }
  }

}
