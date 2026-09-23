import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { GetProductsOptions, ProductPrevModel } from "../../../shared/models/product.model";
import { ProductsService } from "../products.service";
import { Paginated } from "../../../shared/models/paginated.model";
import { BehaviorSubject, combineLatest, debounceTime, map, startWith, take } from "rxjs";
import { BaseProductProperty } from "../../../shared/enums/base-product-property.emum";
import { FormControl } from "@angular/forms";
import { environment } from "../../../../environments/environment";
import { TuiDialogContext, TuiValueContentContext } from "@taiga-ui/core";
import { CurrencyService } from "../../settings/currency/currency.service";
import { CurrencyConfigResponseDto } from "../../../shared/dto/currency-config.dto";
import { EMPTY_ARRAY, TuiHandler, TuiStringHandler } from "@taiga-ui/cdk";
import { CategoryLinearModel, CategoryModel } from "../../../shared/models/category.model";
import { CategoriesService } from "../../categories/categories.service";
import { ActivatedRoute } from "@angular/router";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list-additional.component.html',
  styleUrls: ['./products-list-additional.component.scss'],
})
export class ProductsListAdditionalComponent implements OnInit {
  public currency = environment.currency;
  private currencyValue: number | undefined;
  public productId;
  public linearCategoriesData: CategoryLinearModel[] = [];
  readonly search = new FormControl('');
  readonly categorySelect = new FormControl(this.getLastCategory() || '');
  public categoriesData: ApiDataModel<CategoryModel>;
  readonly categorySelect$ = this.categorySelect.valueChanges.pipe(debounceTime(200), startWith(this.getLastCategory() || ''));
  readonly search$ = this.search.valueChanges.pipe(debounceTime(200), startWith(''));
  readonly limit$ = new BehaviorSubject<number>(20);
  readonly page$ = new BehaviorSubject<number>(0);
  readonly emitter = new EventEmitter<boolean>();
  readonly emitter$ = this.emitter.asObservable();
  readonly editMode$ = new BehaviorSubject<boolean>(false);
  readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  readonly sorter$ = new BehaviorSubject<string>(`name`);
  readonly request$ = combineLatest({
    emitter: this.emitter$,
    category: this.categorySelect$,
    search: this.search$,
    sort: this.sorter$,
    direction: this.direction$,
    page: this.page$,
    limit: this.limit$,
  }).pipe(
    debounceTime(500),
  );
  public productsData: ApiDataModel<Paginated<ProductPrevModel>>;
  public breadcrumbs;
  public env = environment;

  readonly columns = ['media', 'name', 'isStock', 'price', 'categoryId', 'brand'];

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private currencyService: CurrencyService,
    private categoriesService: CategoriesService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, { productId: number }>,
  ) {
    this.productId = this.route.snapshot.params['id'];
    this.breadcrumbs = [
      {
        caption: `Главная`,
        routerLink: `/`,
      },
      {
        caption: `Товары`,
        routerLink: `/products`,
      },
      {
        caption: 'Детали',
        routerLink: `/products/details/${this.productId}`,
      },
      {
        caption: 'Сопутствующие товары',
      }
    ]
  }

  ngOnInit(): void {
    this.categorySelect$.subscribe((res) => {
      if (res) {
        sessionStorage.setItem('products-list-category', res)
      } else {
        sessionStorage.removeItem('products-list-category');
      }
    });
    this.categoriesService.getCategoriesTree().pipe(take(1)).subscribe((res: CategoryModel | null) => {
      this.categoriesData = res;
      if (res) {
        this.linearCategoriesData = this.linearCategory([res]);
        this.categorySelect.setValue(this.getLastCategory() || '');
      }
    });
    this.request$.subscribe(res => {
      const reqOptions: GetProductsOptions = {
        preview: true,
        search: res.search || undefined,
        sort: {
          property: res.sort as BaseProductProperty,
          direction: res.direction,
        },
        pagination: {
          page: res.page,
          limit: res.limit,
        }
      };
      if (res.category) {
        reqOptions.baseProperties = {
          categoryId: {
            $eq: res.category,
          }
        }
      }
      this.getData(reqOptions, res.emitter);
    });
    this.refreshData();
  }

  public onSelectAdditionalProduct(product: ProductPrevModel): void {
    this.context.completeWith(product);
  }

  private getLastCategory(): string | null {
    const sessionCategory = sessionStorage.getItem('products-list-category');
    return sessionCategory || null;
  }

  public clearFilters(): void {
    this.categorySelect.reset();
    sessionStorage.removeItem('products-list-category');
    this.search.reset();
    this.refreshData();
  }

  readonly categoryChildHandler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item => item.children?.sort((a,b) => (a.order || 0) - (b.order || 0)) || EMPTY_ARRAY;

  public changeSize(limit: number): void {
    this.limit$.next(limit);
  }

  public changePage(page: number): void {
    this.page$.next(page);
  }

  public refreshData(withoutLoading: boolean = false): void {
    this.emitter.emit(withoutLoading);
  }

  private linearCategory(treeData: CategoryModel[]): CategoryLinearModel[] {
    const recursionFn = (linearTree: CategoryLinearModel[],categoryNode: CategoryModel): void => {
      linearTree.push({
        _id: categoryNode._id,
        name: categoryNode.name,
        handle: categoryNode.handle,
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

  readonly categoryContent: TuiStringHandler<TuiValueContentContext<readonly unknown[]>> = ({$implicit}) => {
    const categoryItem = (this.linearCategoriesData).find((category => category._id === $implicit.toString()));
    if (categoryItem) {
      return categoryItem.name;
    }
    return 'Выберите категорию';
  };

  public getData(options?: GetProductsOptions, withoutLoading: boolean = false): void {
    if (!withoutLoading) {
      this.productsData = undefined;
    }
    this.currencyService.getCurrencyConfig().subscribe((res: CurrencyConfigResponseDto) => {
      this.currencyValue = res.currency;
      if (res.currency) {
        this.productsService.getProducts<ProductPrevModel>(options).pipe(
          map((res: Paginated<ProductPrevModel> | null) => {
            if (res) {
              res.data = res.data.map((item: ProductPrevModel) => {
                if (typeof item.priceUSD === 'undefined') {
                  item.priceUSD = 0;
                }
                return item;
              })
            }
            return res;
          })
        ).subscribe((res: Paginated<ProductPrevModel> | null) => {
          this.productsData = res || null;
        });
      }
    });
  }

  protected readonly console = console;
}
