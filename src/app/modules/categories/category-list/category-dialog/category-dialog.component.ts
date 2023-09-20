import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiValueContentContext } from "@taiga-ui/core";
import { CategoryLinearModel, CategoryModel } from "../../../../shared/models/category.model";
import { CategoryDialogDataModel } from "../../../../shared/models/category-dialog-data.model";
import { TypesService } from "../../../types/types.service";
import { forkJoin, Observable } from "rxjs";
import { ProductTypePrevModel } from "../../../../shared/models/type-property.model";
import { EMPTY_ARRAY, TuiContextWithImplicit, TuiHandler, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { CategoriesService } from "../../categories.service";
import { ApiDataModel } from "../../../../shared/models/api-data.model";

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent implements OnInit {
  public typesData: ApiDataModel<ProductTypePrevModel[]>;
  public categoriesTreeData: ApiDataModel<CategoryModel>;
  public linearCategoriesData: CategoryLinearModel[] = [];
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    parent: [ this.parentData?._id || this.categoryData?.parent?._id || null ],
    name : [ this.categoryData?.name, Validators.required ],
    handle : [ this.categoryData?.handle, Validators.required ],
    description : [ this.categoryData?.description ],
    type : [ this.categoryData?.productTypeId ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, CategoryDialogDataModel>,
    private formBuilder: FormBuilder,
    private typesService: TypesService,
    private categoriesService: CategoriesService,
  ) { }

  public ngOnInit(): void {
    this.typesService.getTypes().subscribe(res => this.typesData = res);
    this.categoriesService.getCategoriesTree().subscribe((res: CategoryModel | null) => {
      this.categoriesTreeData = res;
      if (res) {
        this.linearCategoriesData = this.linearCategory([res]);
      }
    });
  }

  @tuiPure
  public stringify(
    items: ProductTypePrevModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({_id, name}) => [_id, name] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  get categoryData(): Partial<CategoryModel> | undefined {
    return this.context.data.categoryData;
  }

  get parentData(): CategoryModel | undefined {
    return this.context.data.parentData;
  }

  public get typeListData(): Observable<ProductTypePrevModel[] | null> {
    return this.typesService.getTypes();
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const formValue = this.formGroup.value;
      if (this.categoryData?._id) {
        const requests: Observable<CategoryModel | CategoryModel[] | null>[] = [
          this.categoriesService.updateCategory(this.categoryData._id, {
            name: formValue.name,
            handle: formValue.handle,
            description: formValue.description,
            media: this.categoryData?.media || [],
            children: this.categoryData?.children?.map(item => item._id) || [],
            productTypeId: formValue.type,
          })
        ];
        if (this.parentData?._id !== formValue.parent && formValue.parent && !this.categoryData.root) {
          requests.push(this.categoriesService.moveCategory(this.categoryData._id, formValue.parent));
        }
       forkJoin(requests).subscribe(
          res => this.context.completeWith(res[0]),
          err => this.context.completeWith(null),
        );
      } else {
        this.categoriesService.addCategory({
          parent: formValue.parent,
          name: formValue.name,
          handle: formValue.handle,
          description: formValue.description,
          media: [],
          productTypeId: formValue.type,
          root: this.parentData || formValue.parent ? undefined : true,
        }).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

  readonly categoryContent: TuiStringHandler<TuiValueContentContext<readonly unknown[]>> = ({$implicit}) => {
    const categoryItem = (this.linearCategoriesData || []).find((category => category._id === $implicit.toString()));
    if (categoryItem) {
      return categoryItem.name;
    }
    return 'Неизвестно';
  };

  private linearCategory(treeData: CategoryModel[]): CategoryLinearModel[] {
    const recursionFn = (linearTree: CategoryLinearModel[],categoryNode: CategoryModel): void => {
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

  readonly categoryChildHandler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item =>
    this.categoryData?._id !== item._id ?
      item.children?.filter(subItem =>subItem._id !== this.categoryData?._id) || EMPTY_ARRAY
      : EMPTY_ARRAY;
}
