import {Component, Inject, Injector, OnInit} from '@angular/core';
import {ApiDataModel} from "../../../shared/models/api-data.model";
import {TuiAlertService, TuiDialogService, TuiNotification} from "@taiga-ui/core";
import {ApiLoadingState} from "../../../shared/enums/api-loading-state.enum";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {environment} from "../../../../environments/environment";
import {CurrencyConfigResponseDto} from "../../../shared/dto/currency-config.dto";
import {CurrencyService} from "./currency.service";
import {CurrencyDialogComponent} from "./currency-dialog/currency-dialog.component";

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnInit {
  public currencyConfig: ApiDataModel<CurrencyConfigResponseDto>
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
      caption: `Курс валют`,
      routerLink: `/settings/currency`,
    },
  ];

  constructor(
    private currencyService: CurrencyService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.currencyService.getCurrencyConfig().subscribe(res => this.currencyConfig = res);
  }

  showAddDialog() {
    return;
  }

  public showEditDialog(data: CurrencyConfigResponseDto): void {
    const dialog = this.dialogService.open<CurrencyConfigResponseDto>(
      new PolymorpheusComponent(CurrencyDialogComponent, this.injector),
      {
        label: 'Курс валют',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: CurrencyConfigResponseDto | null) => {
        if (data) {
          this.alertService
            .open(
              `Курс USD ${data.currency}`,
              {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000})
            .subscribe();
          this.refreshData();
        }
      },
    });
  }
}
