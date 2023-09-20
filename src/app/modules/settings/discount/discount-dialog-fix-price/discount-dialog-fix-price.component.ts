import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import {DiscountConfigDto, DiscountConfigResponseDto} from "../../../../shared/dto/discount-config.dto";
import {DiscountService} from "../discount.service";
import {environment} from "../../../../../environments/environment";
import { ApiDataModel } from "../../../../shared/models/api-data.model";
import { CategoryLinearModel, CategoryModel } from "../../../../shared/models/category.model";
import { CategoriesService } from "../../../categories/categories.service";
import { EMPTY_ARRAY, TuiHandler } from "@taiga-ui/cdk";

@Component({
  selector: 'app-discount-dialog',
  templateUrl: './discount-dialog-fix-price.component.html',
  styleUrls: ['./discount-dialog-fix-price.component.scss']
})
export class DiscountDialogFixPriceComponent implements OnInit {
  public loading = true;
  public currency = environment.currency;
  public categoriesData: ApiDataModel<CategoryModel>;
  public linearCategoriesData: CategoryLinearModel[] = [];

  public formGroup: FormGroup = this.formBuilder.group( {
    minCount : [ this.discountConfig?.fixPriceMinCount, Validators.required ],
    fixPrice : [ this.discountConfig?.fixPrice, Validators.required ],
    categories: [ new Set(this.discountConfig?.fixPriceCategories || []) ],
    categoriesArray: [ [] ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, DiscountConfigResponseDto>,
    private formBuilder: FormBuilder,
    private discountService: DiscountService,
    private categoriesService: CategoriesService,
  ) {
    this.f['categories'].valueChanges.subscribe(res => {
      this.f['categoriesArray'].setValue(this.getNamesArray(res));
    });
  }

  private getNamesArray(data: Set<string>): string[] {
    return Array.from(data).map((cat: string) => {
      return this.linearCategoriesData.find(data => data._id === cat.toString())?.name || 'Неизвестно';
    });
  }

  public ngOnInit(): void {
    this.categoriesService.getCategoriesTree().subscribe(res => {
      this.categoriesData = res;
      if (res) {
        this.linearCategoriesData = this.linearCategory([res]);
        this.f['categoriesArray'].setValue(this.getNamesArray(this.f['categories'].value));
        this.loading = false;
      }
    });
  }

  readonly categoryChildHandler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item => item?.children || EMPTY_ARRAY;

  get discountConfig(): DiscountConfigResponseDto{
    return this.context.data;
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  private linearCategory(treeData: CategoryModel[]): CategoryLinearModel[] {
    const recursionFn = (linearTree: CategoryLinearModel[], categoryNode: CategoryModel): void => {
      linearTree.push({
        _id: categoryNode._id,
        name: categoryNode.name,
        productTypeId: categoryNode.productTypeId,
      });
      if (categoryNode.children?.length) {
        categoryNode.children.forEach((child: CategoryModel) => {
          recursionFn(linearTree, child);
        });
      }
    }
    const linearData: CategoryLinearModel[] = [];
    treeData.forEach((item: CategoryModel) => recursionFn(linearData, item));
    return linearData;
  }

  toggleCheckbox(category: CategoryModel): void {
    const selectedCategories: Set<string> = this.f['categories'].value;
    if (selectedCategories.has(category._id)) {
      selectedCategories.delete(category._id);
    } else {
      selectedCategories.add(category._id);
    }
    this.f['categories'].setValue(selectedCategories);
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.discountConfig._id){
        const payload: DiscountConfigDto = {
          minCount: this.discountConfig.minCount,
          discount: this.discountConfig.discount,
          fixPriceMinCount: this.formGroup.value.minCount,
          fixPriceCategories: Array.from(this.formGroup.value.categories),
          fixPrice: this.formGroup.value.fixPrice,
        }
        this.discountService.updateDiscountConfig(this.discountConfig._id, payload).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }
}
