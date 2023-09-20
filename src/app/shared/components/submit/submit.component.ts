import { Component, Inject } from '@angular/core';
import { TuiDialogContext, TuiDialogService } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent {

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, any>,
  ) { }

  public get data(): { info: string; button: string; } {
    return this.context.data;
  }

  submit(): void {
    this.context.completeWith(true);
  }

  cancel(): void {
    this.context.completeWith(null);
  }

}
