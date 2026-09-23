import { Inject, Injectable, Injector } from '@angular/core';
import { TuiDialogService } from "@taiga-ui/core";
import { Observable } from "rxjs";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { SubmitComponent } from "../components/submit/submit.component";

@Injectable({
  providedIn: 'root'
})
export class SubmitService {

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
  ) { }

  submitDialog(button: string, info?: string): Observable<any> {
    return this.dialogService.open<any>(
      new PolymorpheusComponent(SubmitComponent, this.injector),
      {
        data: {
          button,
          info
        },
        label: `Подтвердите действие`,
        size: "s",
      },
    );
  }
}
