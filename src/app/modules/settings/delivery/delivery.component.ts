import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { DeliveryService } from "./delivery.service";
import { DeliveryMethodResponseDto } from "../../../shared/dto/delivery-method.dto";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { SubmitService } from "../../../shared/services/submit.service";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { DeliveryDialogComponent } from "./delivery-dialog/delivery-dialog.component";

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent implements OnInit {
  public deliveryData: ApiDataModel<DeliveryMethodResponseDto[]>
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
      caption: `Методы доставки`,
      routerLink: `/settings/delivery`,
    },
  ];

  constructor(
    private deliveryService: DeliveryService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.deliveryData = undefined;
    this.deliveryService.getDeliveryMethods().subscribe(res => this.deliveryData = res);
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<DeliveryMethodResponseDto>(
      new PolymorpheusComponent(DeliveryDialogComponent, this.injector),
      {
        label: 'Метод доставки',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: DeliveryMethodResponseDto | null) => {
        if (data) {
          this.alertService.open(`Метод доставки ${data.name} создан`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(data: DeliveryMethodResponseDto): void {
    const dialog = this.dialogService.open<DeliveryMethodResponseDto>(
      new PolymorpheusComponent(DeliveryDialogComponent, this.injector),
      {
        label: 'Метод доставки',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: DeliveryMethodResponseDto | null) => {
        if (data) {
          this.alertService.open(data.name === data.name ? `Метод доставки ${data.name} изменен` : `Метод доставки ${data.name} изменен. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить метод доставки: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.deliveryService.deleteDeliveryMethod(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Метод доставки ${title} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }

}
