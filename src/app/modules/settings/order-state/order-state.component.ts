import { Component, Inject, Injector, OnInit } from '@angular/core';
import { OrderStateService } from "./order-state.service";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { SubmitService } from "../../../shared/services/submit.service";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { OrderStateResponseDto } from "../../../shared/dto/order-state.dto";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { OrderStateDialogComponent } from "./order-state-dialog/order-state-dialog.component";

@Component({
  selector: 'app-order-state',
  templateUrl: './order-state.component.html',
  styleUrls: ['./order-state.component.scss']
})
export class OrderStateComponent implements OnInit {
  public orderStateData: ApiDataModel<OrderStateResponseDto[]>
  public apiLoadingState = ApiLoadingState;

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
      caption: `Статусы заказа`,
      routerLink: `/settings/order-state`,
    },
  ];

  constructor(
    private orderStateService: OrderStateService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.orderStateData = undefined;
    this.orderStateService.getOrderStates().subscribe(res => this.orderStateData = res);
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<OrderStateResponseDto>(
      new PolymorpheusComponent(OrderStateDialogComponent, this.injector),
      {
        label: 'Статус заказа',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: OrderStateResponseDto | null) => {
        if (data) {
          this.alertService.open(`Статус заказа ${data.label} создан`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(data: OrderStateResponseDto): void {
    const dialog = this.dialogService.open<OrderStateResponseDto>(
      new PolymorpheusComponent(OrderStateDialogComponent, this.injector),
      {
        label: 'Статус заказа',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: OrderStateResponseDto | null) => {
        if (data) {
          this.alertService.open(data.label === data.label ? `Статус заказа ${data.label} изменен` : `Статус заказа ${data.label} изменен. Новое название ${data.label}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить статус заказа: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.orderStateService.deleteOrderState(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Статус заказа ${title} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }

}
