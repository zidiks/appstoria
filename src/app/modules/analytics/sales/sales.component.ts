import { Component, Inject, Input } from '@angular/core';
import { TuiDay, TuiDayLike, TuiDayRange, TuiMonth, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { map, Observable } from "rxjs";
import { TUI_MONTHS } from "@taiga-ui/core";

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {
  @Input() public maxLength!: TuiDayLike;
  @Input() public range!: TuiDayRange;

  readonly xStringify$: Observable<TuiStringHandler<TuiDay>> = this.months$.pipe(
    map(
      months =>
        ({month, day}) =>
          `${months[month]}, ${day}`,
    ),
  );

  constructor(
    @Inject(TUI_MONTHS) private readonly months$: Observable<readonly string[]>,
  ) {}

  get value(): ReadonlyArray<[TuiDay, number]> {
    return this.computeValue(this.range);
  }

  @tuiPure
  computeLabels$({from, to}: TuiDayRange): Observable<readonly string[]> {
    return this.months$.pipe(
      map(months =>
        Array.from(
          {length: TuiMonth.lengthBetween(from, to) + 1},
          (_, i) => months[from.append({month: i}).month],
        ),
      ),
    );
  }

  readonly yStringify: TuiStringHandler<number> = y =>
    `${(10 * y).toLocaleString(`ru-RU`, {maximumFractionDigits: 0})}`;

  @tuiPure
  private computeValue({from, to}: TuiDayRange): ReadonlyArray<[TuiDay, number]> {
    return new Array(TuiDay.lengthBetween(from, to) + 1)
      .fill(0)
      .reduce<ReadonlyArray<[TuiDay, number]>>(
        (array, _, i) => [
          ...array,
          [
            from.append({day: i}),
            (i ? array[i - 1][1] : 50) + Math.random() * 10 - 5,
          ],
        ],
        [],
      );
  }
}
