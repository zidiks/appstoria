import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { ProductTypeModel, ProductTypePrevModel } from "../../../shared/models/type-property.model";
import { TypesService } from "../types.service";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { SubmitService } from "../../../shared/services/submit.service";
import { TypesDialogComponent } from "./types-dialog/types-dialog.component";

@Component({
  selector: 'app-types-list',
  templateUrl: './types-list.component.html',
  styleUrls: ['./types-list.component.scss']
})
export class TypesListComponent implements OnInit {
  public typesData: ApiDataModel<ProductTypePrevModel[]>;
  public apiLoadingState = ApiLoadingState;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Типы товара`,
      routerLink: `/types`,
    },
  ];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private typesService: TypesService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.typesData = undefined;
    this.typesService.getTypes().subscribe((res: ProductTypePrevModel[] | null) => {
      this.typesData = res || null;
    })
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<null>(
      new PolymorpheusComponent(TypesDialogComponent, this.injector),
      {
        label: 'Тип товара',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: ProductTypeModel | null) => {
        if (data) {
          this.alertService.open(`Тип товара ${data.name} создан`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(type: ProductTypePrevModel): void {
    const dialog = this.dialogService.open<ProductTypeModel>(
      new PolymorpheusComponent(TypesDialogComponent, this.injector),
      {
        label: 'Тип товара',
        size: 'l',
        data: type,
      }
    );
    dialog.subscribe({
      next: (data: ProductTypeModel | null) => {
        if (data) {
          this.alertService.open(type.name === data.name ? `Тип товара ${type.name} изменен` : `Тип товара ${type.name} изменен. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить тип товара: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.typesService.deleteType(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Тип товара ${title} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }

}
