import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginationIndex'
})
export class PaginationIndexPipe implements PipeTransform {

  transform(value: any): number {
    if (value) {
      const number: number = parseInt(value as any);
      if (number) {
        return number - 1;
      }
      return 0;
    }
    return 0;
  }

}
