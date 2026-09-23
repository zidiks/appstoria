import { Pipe, PipeTransform } from '@angular/core';
import { ApiDataModel } from "../../models/api-data.model";
import { ApiLoadingState, ApiLoadingStateKeys } from "../../enums/api-loading-state.enum";

@Pipe({
  name: 'apiLoadingState'
})
export class ApiLoadingStatePipe implements PipeTransform {

  transform(value: ApiDataModel<any> | ApiDataModel<any>[], stateKey: ApiLoadingStateKeys = 'Pending', multiple: boolean = false): boolean {
    let currentState;
    if (multiple && Array.isArray(value)) {
      currentState = value.some(item => item === undefined) ? ApiLoadingState.Pending
        : value.every(item => item !== undefined) && value.some(item => item === null || value.length === 0) ? ApiLoadingState.Empty
          : ApiLoadingState.Success;
    } else {
      currentState = value === undefined ? ApiLoadingState.Pending
        : (value === null || value?.length == 0) ? ApiLoadingState.Empty
          : ApiLoadingState.Success;
    }
    return currentState === ApiLoadingState[stateKey];
  }

}
