import { Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { Subscription, interval, switchMap } from "rxjs";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { SubmitService } from "../../../shared/services/submit.service";
import { MerchantImportService } from "./merchant-import.service";
import { MerchantImportSourceResponseDto } from "../../../shared/dto/merchant-import.dto";
import { MerchantImportDialogComponent } from "./merchant-import-dialog/merchant-import-dialog.component";

const POLL_INTERVAL = 3000;

@Component({
  selector: 'app-merchant-import',
  templateUrl: './merchant-import.component.html',
  styleUrls: ['./merchant-import.component.scss']
})
export class MerchantImportComponent implements OnInit, OnDestroy {
  public sources: ApiDataModel<MerchantImportSourceResponseDto[]>;
  public apiLoadingState = ApiLoadingState;
  private pollSubscription?: Subscription;

  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Настройки`,
      routerLink: `/settings`,
    },
    {
      caption: `Импорт из merchant.xml`,
      routerLink: `/settings/merchant-import`,
    },
  ];

  constructor(
    private merchantImportService: MerchantImportService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  public refreshData(): void {
    this.sources = undefined;
    this.merchantImportService.getSources().subscribe(res => this.apply(res));
  }

  public showAddDialog(): void {
    this.openDialog();
  }

  public showEditDialog(source: MerchantImportSourceResponseDto): void {
    this.openDialog(source);
  }

  public run(source: MerchantImportSourceResponseDto): void {
    this.merchantImportService.runSource(source._id).subscribe(res => {
      if (res) {
        this.alertService.open(`Импорт «${source.name}» запущен`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
        this.merchantImportService.getSources().subscribe(list => this.apply(list));
      }
    });
  }

  public showDeleteDialog(source: MerchantImportSourceResponseDto): void {
    this.submitService.submitDialog('Удалить', `Удалить источник «${source.name}»? Импортированные товары останутся в каталоге и перестанут обновляться.`).subscribe({
      next: (res) => {
        if (res) {
          this.merchantImportService.deleteSource(source._id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Источник «${source.name}» удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    });
  }

  public nextRunAt(source: MerchantImportSourceResponseDto): Date | null {
    if (!source.enabled) return null;
    if (!source.lastRunAt) return new Date();
    return new Date(new Date(source.lastRunAt).getTime() + source.intervalHours * 3_600_000);
  }

  private openDialog(data?: MerchantImportSourceResponseDto): void {
    this.dialogService.open<MerchantImportSourceResponseDto | null>(
      new PolymorpheusComponent(MerchantImportDialogComponent, this.injector),
      {
        label: 'Источник merchant.xml',
        size: 'l',
        data,
      }
    ).subscribe({
      next: (res) => {
        if (res) {
          this.alertService.open(`Источник «${res.name}» ${data ? 'сохранен' : 'добавлен'}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  /** Пока хоть один импорт идёт — опрашиваем список, чтобы видеть прогресс */
  private apply(res: MerchantImportSourceResponseDto[] | null): void {
    this.sources = res;
    const running = (res || []).some(source => source.running);
    if (running && !this.pollSubscription) {
      this.pollSubscription = interval(POLL_INTERVAL)
        .pipe(switchMap(() => this.merchantImportService.getSources()))
        .subscribe({
          next: (list) => this.apply(list),
          error: () => this.stopPolling(),
        });
    } else if (!running) {
      this.stopPolling();
    }
  }

  private stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = undefined;
  }
}
