import { NgModule } from '@angular/core';
import { ApiLoadingStatePipe } from "./api-loading-state.pipe";
import { ApiLoadingStatePipeValue } from "./api-loading-state-value.pipe";

@NgModule({
  declarations: [
    ApiLoadingStatePipe,
    ApiLoadingStatePipeValue,
  ],
  exports: [
    ApiLoadingStatePipe,
    ApiLoadingStatePipeValue,
  ]
})
export class ApiLoadingStateModule { }
