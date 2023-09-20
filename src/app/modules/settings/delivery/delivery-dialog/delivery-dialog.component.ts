import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DeliveryService } from "../delivery.service";
import {
  AddDeliveryMethodRequestDto,
  DeliveryMethodResponseDto,
  UpdateDeliveryMethodRequestDto
} from "../../../../shared/dto/delivery-method.dto";
import { PaymentService } from "../../payment/payment.service";
import { BehaviorSubject, map, Observable, shareReplay, startWith, Subject, switchMap } from "rxjs";
import { PaymentMethodResponseDto } from "../../../../shared/dto/payment-method.dto";
import { TUI_DEFAULT_MATCHER, TuiContextWithImplicit, TuiHandler, tuiIsString } from "@taiga-ui/cdk";

@Component({
  selector: 'app-delivery-dialog',
  templateUrl: './delivery-dialog.component.html',
  styleUrls: ['./delivery-dialog.component.scss']
})
export class DeliveryDialogComponent {
  public loading = true;
  private paymentsDataSubject: BehaviorSubject<PaymentMethodResponseDto[]> = new BehaviorSubject<PaymentMethodResponseDto[]>([]);
  public paymentsData$: Observable<PaymentMethodResponseDto[]> = this.paymentsDataSubject.asObservable();

  public formGroup: FormGroup = this.formBuilder.group( {
    name : [ this.deliveryData?.name, Validators.required ],
    description : [ this.deliveryData?.description, Validators.required ],
    fields: [ this.deliveryData?.fields || [] ],
    paymentMethods: [ this.deliveryData?.paymentMethods || [] ],
  } );

  private readonly payments$ = this.paymentsData$.pipe(
    shareReplay({bufferSize: 1, refCount: true}),
  );

  private readonly search$ = new Subject<string>();

  readonly items$ = this.search$.pipe(
    startWith(``),
    switchMap(search =>
      this.payments$.pipe(
        map(items =>
          items
            .filter(({name}) => TUI_DEFAULT_MATCHER(name, search))
            .map(({_id}) => _id),
        ),
      ),
    ),
    startWith(null),
  );

  readonly stringify$: Observable<
    TuiHandler<string | TuiContextWithImplicit<string>, string>
    > = this.payments$.pipe(
    map(items => new Map(items.map<[string, string]>(({_id, name}) => [_id, name]))),
    startWith(new Map()),
    map(
      map => (_id: string | TuiContextWithImplicit<string>) => {
        return (tuiIsString(_id) ? map.get(_id) : map.get(_id?.$implicit)) || `Loading...`;
      }
    ),
  );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, DeliveryMethodResponseDto | undefined>,
    private formBuilder: FormBuilder,
    private deliveryService: DeliveryService,
    private paymentsService: PaymentService,
  ) {
    paymentsService.getPaymentMethods().subscribe(res => {
      this.paymentsDataSubject.next(res || []);
      this.loading = false;
    });
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  get deliveryData(): Partial<DeliveryMethodResponseDto> | undefined {
    return this.context.data;
  }

  public onSearch(search: string | null): void {
    this.search$.next(search || ``);
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.deliveryData?._id) {
        this.deliveryService.updateDeliveryMethod(this.deliveryData._id, this.formGroup.value as UpdateDeliveryMethodRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      } else {
        this.deliveryService.addDeliveryMethod(this.formGroup.value as AddDeliveryMethodRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

}
