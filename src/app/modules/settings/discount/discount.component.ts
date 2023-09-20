import {Component, Inject, Injector, OnInit} from '@angular/core';
import {ApiDataModel} from "../../../shared/models/api-data.model";
import {DiscountConfigResponseDto} from "../../../shared/dto/discount-config.dto";
import {TuiAlertService, TuiDialogService, TuiNotification} from "@taiga-ui/core";
import {DiscountService} from "./discount.service";
import {ApiLoadingState} from "../../../shared/enums/api-loading-state.enum";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {DiscountDialogComponent} from "./discount-dialog/discount-dialog.component";
import {environment} from "../../../../environments/environment";
import {DiscountDialogFixPriceComponent} from "./discount-dialog-fix-price/discount-dialog-fix-price.component";

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {
  public discountConfig: ApiDataModel<DiscountConfigResponseDto>
  public apiLoadingState = ApiLoadingState;
  public currency = environment.currency;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Настройки`,
      routerLink: `/settings`,
    },
    {
      caption: `Дисконтная программа`,
      routerLink: `/settings/discount`,
    },
  ];

  constructor(
    private discountService: DiscountService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.discountService.getDiscountConfig().subscribe(res => this.discountConfig = res);
  }

  showAddDialog() {
    return;
  }

  public showEditDialog(data: DiscountConfigResponseDto): void {
    const dialog = this.dialogService.open<DiscountConfigResponseDto>(
      new PolymorpheusComponent(DiscountDialogComponent, this.injector),
      {
        label: 'Дисконтная программа',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: DiscountConfigResponseDto | null) => {
        if (data) {
          this.alertService
            .open(
                `Количество товаров ${data.minCount}, процент скидки ${data.discount}`,
              {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000})
            .subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showFixPriceEditDialog(data: DiscountConfigResponseDto): void {
    const dialog = this.dialogService.open<DiscountConfigResponseDto>(
      new PolymorpheusComponent(DiscountDialogFixPriceComponent, this.injector),
      {
        label: 'Дисконтная программа (фикс. цена)',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: DiscountConfigResponseDto | null) => {
        if (data) {
          this.alertService
            .open(
              `Количество товаров ${data.minCount}, цена за ед. товара ${data.discount}`,
              {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000})
            .subscribe();
          this.refreshData();
        }
      },
    });
  }
}
