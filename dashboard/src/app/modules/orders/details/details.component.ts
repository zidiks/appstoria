import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Clipboard } from '@angular/cdk/clipboard';
import { TuiAlertService, TuiHostedDropdownComponent, TuiNotification } from "@taiga-ui/core";
import { HistoryDataItem, HistoryDataItemWithCode } from "../../../shared/models/order.model";
import { OrdersService } from "../orders.service";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { historyDataItems } from "../../../shared/functions/history-data-item.func";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { forkJoin, Observable, startWith } from "rxjs";
import { historyData } from "../../../shared/constants/order-history.const";
import { OrderHistory } from "../../../shared/enums/order-history.enum";
import { OrderResponseDto, UpdateOrderRequestDto } from "../../../shared/dto/order.dto";
import { OrderStateService } from "../../settings/order-state/order-state.service";
import { OrderStateResponseDto } from "../../../shared/dto/order-state.dto";
import { SubmitService } from "../../../shared/services/submit.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  public breadcrumbs;
  public orderId;
  public dropdownOpen = false;
  public orderData: ApiDataModel<OrderResponseDto>;
  public statesData: ApiDataModel<OrderStateResponseDto[]>;
  public historyDataItems: HistoryDataItem[] = historyDataItems();
  public historySelectedType: HistoryDataItemWithCode | undefined;
  public waitUpdating = false;
  public statePickerOpen = false;
  public env = environment;

  public historyFormGroup: FormGroup = this.formBuilder.group({
    type: [historyData[OrderHistory.Message], Validators.required],
    details: ['', Validators.required],
    products: [[]],
  });
  private initialHistoryFormGroupValue = this.historyFormGroup.value;

  @ViewChild(TuiHostedDropdownComponent) dropdownElement?: TuiHostedDropdownComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private orderService: OrdersService,
    private orderStateService: OrderStateService,
    private formBuilder: FormBuilder,
    private submitService: SubmitService,
  ) {
    this.orderId = this.route.snapshot.params['id'];
    this.breadcrumbs = [
      {
        caption: `Главная`,
        routerLink: `/`,
      },
      {
        caption: `Заказы`,
        routerLink: `/orders`,
      },
      {
        caption: `Детали`,
        routerLink: `/orders/details/${this.orderId}`,
      },
    ];
  }

  public copyToClipboard(textToCopy: string) {
    this.clipboard.copy(textToCopy);
    this.alertService.open('ID заказа скопирован', {label: `Копирование `, status: TuiNotification.Success, autoClose: 7000}).subscribe();
  }

  ngOnInit(): void {
    this.refreshData();
  }

  public showDeleteDialog(): void {
    if (this.orderData) {
      this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить заказ: ${this.orderData.orderCode}?`).subscribe({
        next: (res) => {
          if (res && this.orderData) {
            this.waitUpdating = true;
            this.orderService.deleteOrder(this.orderData._id).subscribe((res) => {
              if (this.orderData && res) {
                this.alertService.open(`Заказ ${this.orderData.orderCode} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/orders'])
              }
            });
          }
        },
      })
    }
  }

  public setOrderState({label, description, color}: OrderStateResponseDto): void {
    if (this.orderData) {
      this.orderData.state = { label, description, color };
    }
    this.statePickerOpen = false;
    this.dropdownElement?.nativeFocusableElement?.focus();
  }

  public addOrderHistoryItem(): void {
    const formValue = this.historyFormGroup.value;
    if (this.orderData) {
      this.orderData.historyList.push({
        type: formValue.type.type,
        details: formValue.details,
        time: new Date().getTime(),
      });
      this.historyFormGroup.reset(this.initialHistoryFormGroupValue);
    }
  }

  public updateOrder(): void {
    if (this.orderData?._id) {
     const payload: UpdateOrderRequestDto = {
       customer: this.orderData.customer,
       state: this.orderData.state,
       delivery: this.orderData.delivery,
       paymentMethod: this.orderData.paymentMethod,
       cartItems: this.orderData.cartItems,
       subTotalPrice: this.orderData.subTotalPrice,
       totalPrice: this.orderData.totalPrice,
       totalDiscount: this.orderData.totalDiscount,
       historyList: this.orderData.historyList,
     }
     const id = this.orderData._id;
     this.waitUpdating = true;
     this.orderService.updateOrder(id, payload).subscribe(
       res => {
         if (res) {
           this.alertService.open(`Изменения сохранены`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
         }
         this.orderData = res;
         this.waitUpdating = false;
       },
       err => {
         this.orderData = null;
         this.waitUpdating = false;
       }
      );
    }
  }

  public removeOrderHistoryItem(index: number): void {
    if (this.orderData) {
      this.orderData.historyList.splice(index, 1);
    }
  }

  public get f(): { [key: string]: AbstractControl; } { return this.historyFormGroup.controls; }

  public setCurrentHistoryType(item: HistoryDataItem): void {
    this.dropdownOpen = false;
    this.dropdownElement?.nativeFocusableElement?.focus();
    this.f['type'].setValue(item);
  }

  public get currentHistoryType$(): Observable<HistoryDataItem> {
    const field = this.f['type'];
    return field!.valueChanges.pipe(startWith(field!.value));
  }

  public refreshData(): void {
    this.orderData = undefined;
    forkJoin({
      order: this.orderService.getOrderById(this.orderId),
      states: this.orderStateService.getOrderStates(),
    }).subscribe((res: { order: OrderResponseDto | null; states: OrderStateResponseDto[] | null }) => {
      this.orderData = res.order;
      this.statesData = res.states;
    });
  }

}
