import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { PaymentService } from "../payment.service";
import {
  AddPaymentMethodRequestDto,
  PaymentMethodResponseDto,
  UpdatePaymentMethodRequestDto
} from "../../../../shared/dto/payment-method.dto";

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent {
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    name : [ this.paymentData?.name, Validators.required ],
    description : [ this.paymentData?.description, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, PaymentMethodResponseDto | undefined>,
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
  ) { }

  get paymentData(): Partial<PaymentMethodResponseDto> | undefined {
    return this.context.data;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.paymentData?._id) {
        this.paymentService.updatePaymentMethod(this.paymentData._id, this.formGroup.value as UpdatePaymentMethodRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      } else {
        this.paymentService.addPaymentMethod(this.formGroup.value as AddPaymentMethodRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

}
