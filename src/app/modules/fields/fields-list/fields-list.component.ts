import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FieldsService } from "../fields.service";
import { tuiTablePaginationOptionsProvider } from "@taiga-ui/addon-table";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { BrandModel } from "../../../shared/models/brand.model";
import { SubmitService } from "../../../shared/services/submit.service";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { FieldDialogComponent } from "./field-dialog/field-dialog.component";
import { FieldModel } from "../../../shared/models/field.model";

@Component({
  selector: 'app-fields-list',
  templateUrl: './fields-list.component.html',
  styleUrls: ['./fields-list.component.scss'],
  providers: [
    tuiTablePaginationOptionsProvider({
      showPages: true,
    }),
  ],
})
export class FieldsListComponent implements OnInit {
  public page = 0;
  public size = 10;
  public fieldsData: ApiDataModel<FieldModel[]>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Поля`,
      routerLink: `/fields`,
    },
  ];

  readonly columns = ['label', 'code', 'value', 'type'];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private fieldsService: FieldsService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.fieldsData = undefined;
    this.fieldsService.getFields().subscribe((res: FieldModel[] | null) => {
      this.fieldsData = res;
    });
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<FieldModel | null>(
      new PolymorpheusComponent(FieldDialogComponent, this.injector),
      {
        label: 'Поле',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: FieldModel | null) => {
        if (data) {
          this.alertService.open(`Поле ${data.label} создао`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(field: FieldModel): void {
    const dialog = this.dialogService.open<FieldModel | null>(
      new PolymorpheusComponent(FieldDialogComponent, this.injector),
      {
        label: 'Поле',
        size: 'l',
        data: field,
      }
    );
    dialog.subscribe({
      next: (data: FieldModel | null) => {
        if (data) {
          this.alertService.open(`Поле ${field.label} изменено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить поле: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.fieldsService.deleteField(id).subscribe(() => {
            this.alertService.open(`Поле ${title} удалено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
            this.refreshData();
          });
        }
      },
    })
  }

}
