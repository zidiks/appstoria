import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {CurrencyService} from "../currency.service";
import {CurrencyConfigDto, CurrencyConfigResponseDto} from "../../../../shared/dto/currency-config.dto";

@Component({
  selector: 'app-currency-dialog',
  templateUrl: './currency-dialog.component.html',
  styleUrls: ['./currency-dialog.component.scss']
})
export class CurrencyDialogComponent {
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    currency : [ this.currencyConfig?.currency, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, CurrencyConfigResponseDto>,
    private formBuilder: FormBuilder,
    private currencyService: CurrencyService,
  ) { }

  get currencyConfig(): CurrencyConfigResponseDto{
    return this.context.data;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.currencyConfig._id){
        const payload: CurrencyConfigDto = {
          currency: this.formGroup.value.currency,
        }
        this.currencyService.updateCurrencyConfig(this.currencyConfig._id, payload).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }
}
