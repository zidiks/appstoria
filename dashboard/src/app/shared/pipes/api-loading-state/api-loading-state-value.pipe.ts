import { Pipe, PipeTransform } from '@angular/core';
import { ApiDataModel } from "../../models/api-data.model";
import { ApiLoadingState } from "../../enums/api-loading-state.enum";

@Pipe({
  name: 'apiLoadingStateValue'
})
export class ApiLoadingStatePipeValue implements PipeTransform {

  transform(value: ApiDataModel<any> | ApiDataModel<any>[], multiple: boolean = false): ApiLoadingState {
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
    return currentState;
  }

}
