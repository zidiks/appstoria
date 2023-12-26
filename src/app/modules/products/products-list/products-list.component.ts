import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { GetProductsOptions, ProductPrevModel } from "../../../shared/models/product.model";
import { ProductsService } from "../products.service";
import { Paginated } from "../../../shared/models/paginated.model";
import { BehaviorSubject, combineLatest, debounceTime, map, startWith } from "rxjs";
import { BaseProductProperty } from "../../../shared/enums/base-product-property.emum";
import { FormControl } from "@angular/forms";
import { environment } from "../../../../environments/environment";
import { UpdateProductDto } from "../../../shared/dto/products.dto";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";
import { CurrencyService } from "../../settings/currency/currency.service";
import { CurrencyConfigResponseDto } from "../../../shared/dto/currency-config.dto";
import { floorRound } from "../../../shared/functions/floor-round.func";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  public currency = environment.currency;
  private currencyValue: number | undefined;
  readonly search = new FormControl('');
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
    search: this.search$,
    sort: this.sorter$,
    direction: this.direction$,
    page: this.page$,
    limit: this.limit$,
  }).pipe(
    debounceTime(0),
  );
  public productsData: ApiDataModel<Paginated<ProductPrevModel>>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Товары`,
      routerLink: `/products`,
    },
  ];
  public env = environment;

  readonly columns = ['media', 'name', 'isStock', 'price', 'categoryId', 'brand'];

  constructor(
    private productsService: ProductsService,
    private currencyService: CurrencyService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  ngOnInit(): void {
    this.request$.subscribe(res => {
      this.getData({
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
      }, res.emitter);
    });
    this.refreshData();
  }

  public changeEditMode(): void {
    this.editMode$.next(!this.editMode$.value);
  }

  public saveEditChange(data: ProductPrevModel): void {
    if (!this.currencyValue) {
      return;
    }
    const dataCopy = Object.assign({}, data);
    const price = floorRound(dataCopy.priceUSD * this.currencyValue);
    const discount = dataCopy.price * (dataCopy.discount || 0) * 0.01;
    const totalPrice = floorRound(dataCopy.priceUSD * this.currencyValue - discount);
    const updateDto: Partial<UpdateProductDto> = {
      priceUSD: dataCopy.priceUSD,
      totalPrice: totalPrice,
      price: price,
      isStock: dataCopy.isStock,
    }
    console.log(updateDto);
    this.productsService.updateProductPartial(dataCopy._id, updateDto as Partial<UpdateProductDto>).subscribe(
      res => {
        if (res) {
          this.alertService.open(`Продукт ${res.name} обновлён`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData(true);
        }
      },
    );
  }

  public changeSize(limit: number): void {
    this.limit$.next(limit);
  }

  public changePage(page: number): void {
    this.page$.next(page);
  }

  public refreshData(withoutLoading: boolean = false): void {
    this.emitter.emit(withoutLoading);
  }

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

}
