import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { PaymentService } from "./payment.service";
import { PaymentMethodResponseDto } from "../../../shared/dto/payment-method.dto";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { PaymentDialogComponent } from "./payment-dialog/payment-dialog.component";
import { SubmitService } from "../../../shared/services/submit.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  public paymentData: ApiDataModel<PaymentMethodResponseDto[]>
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
      caption: `Методы оплаты`,
      routerLink: `/settings/payment`,
    },
  ];

  constructor(
    private paymentService: PaymentService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.paymentData = undefined;
    this.paymentService.getPaymentMethods().subscribe(res => this.paymentData = res);
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<PaymentMethodResponseDto>(
      new PolymorpheusComponent(PaymentDialogComponent, this.injector),
      {
        label: 'Метод оплаты',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: PaymentMethodResponseDto | null) => {
        if (data) {
          this.alertService.open(`Метод оплаты ${data.name} создан`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(data: PaymentMethodResponseDto): void {
    const dialog = this.dialogService.open<PaymentMethodResponseDto>(
      new PolymorpheusComponent(PaymentDialogComponent, this.injector),
      {
        label: 'Метод оплаты',
        size: 'l',
        data,
      }
    );
    dialog.subscribe({
      next: (data: PaymentMethodResponseDto | null) => {
        if (data) {
          this.alertService.open(data.name === data.name ? `Метод оплаты ${data.name} изменен` : `Метод оплаты ${data.name} изменен. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить метод оплаты: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.paymentService.deletePaymentMethod(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Метод оплаты ${title} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }

}
