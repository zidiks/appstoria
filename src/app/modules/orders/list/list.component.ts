import { Component, EventEmitter, OnInit } from '@angular/core';
import { tuiTablePaginationOptionsProvider } from "@taiga-ui/addon-table";
import { OrdersService } from "../orders.service";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { OrderResponseDto } from "../../../shared/dto/order.dto";
import { BehaviorSubject, combineLatest, debounceTime } from "rxjs";
import { BaseOrderPropertyEnum } from "../../../shared/enums/base-order-property.enum";
import { Paginated } from "../../../shared/models/paginated.model";
import { GetOrdersOptions } from "../../../shared/models/order.model";

@Component({
  selector: 'app-category-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [
    tuiTablePaginationOptionsProvider({
      showPages: true,
    }),
  ],
})
export class ListComponent implements OnInit {
  readonly baseOrderPropertyEnum = BaseOrderPropertyEnum;
  readonly limit$ = new BehaviorSubject<number>(20);
  readonly page$ = new BehaviorSubject<number>(0);
  readonly emitter = new EventEmitter();
  readonly emitter$ = this.emitter.asObservable();
  readonly direction$ = new BehaviorSubject<-1 | 1>(-1);
  readonly sorter$ = new BehaviorSubject<string>(BaseOrderPropertyEnum.Date);
  readonly request$ = combineLatest({
    emitter: this.emitter$,
    sort: this.sorter$,
    direction: this.direction$,
    page: this.page$,
    limit: this.limit$,
  }).pipe(
    debounceTime(0),
  );
  public ordersData: ApiDataModel<Paginated<OrderResponseDto>>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Заказы`,
      routerLink: `/orders`,
    },
  ];

  readonly columns = ['id', this.baseOrderPropertyEnum.Date, this.baseOrderPropertyEnum.Customer, this.baseOrderPropertyEnum.Price, this.baseOrderPropertyEnum.State];

  constructor(
    private ordersService: OrdersService,
  ) { }

  ngOnInit(): void {
    this.request$.subscribe(res => {
      this.getData({
        sort: {
          property: res.sort as BaseOrderPropertyEnum,
          direction: res.direction,
        },
        pagination: {
          page: res.page,
          limit: res.limit,
        }
      });
    });
    this.refreshData();
  }

  public refreshData(): void {
    this.emitter.emit();
  }

  public changeSize(limit: number): void {
    this.limit$.next(limit);
  }

  public changePage(page: number): void {
    this.page$.next(page);
  }

  public getData(options?: GetOrdersOptions): void {
    this.ordersData = undefined;
    this.ordersService.getOrders(options).subscribe((res: Paginated<OrderResponseDto> | null) => {
      this.ordersData = res || null;
    });
  }

}
