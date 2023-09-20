import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { OrderStateService } from "../order-state.service";
import {
  AddOrderStateRequestDto,
  OrderStateResponseDto,
  UpdateOrderStateRequestDto
} from "../../../../shared/dto/order-state.dto";
import { StateColor } from "../../../../shared/enums/state-colors.enum";
import { stateColors } from "../../../../shared/constants/state-colors.const";

@Component({
  selector: 'app-order-state-dialog',
  templateUrl: './order-state-dialog.component.html',
  styleUrls: ['./order-state-dialog.component.scss']
})
export class OrderStateDialogComponent {
  public loading = false;
  public stateColors = Object.values(StateColor);
  public stateColorsData = stateColors;

  public formGroup: FormGroup = this.formBuilder.group( {
    label : [ this.orderStateData?.label, Validators.required ],
    color: [this.orderStateData?.color, Validators.required ],
    description : [ this.orderStateData?.description ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, OrderStateResponseDto | undefined>,
    private formBuilder: FormBuilder,
    private orderStateService: OrderStateService,
  ) { }

  get orderStateData(): Partial<OrderStateResponseDto> | undefined {
    return this.context.data;
  }

  public getColorName(code: any): string {
    return Object.values(StateColor).includes(code) ? stateColors[code as StateColor] : stateColors[StateColor.Neutral];
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.orderStateData?._id) {
        this.orderStateService.updateOrderState(this.orderStateData._id, this.formGroup.value as UpdateOrderStateRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      } else {
        this.orderStateService.addOrderState(this.formGroup.value as AddOrderStateRequestDto).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

}
