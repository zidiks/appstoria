import { Component, Inject, Injector, OnInit } from '@angular/core';
import { BrandsService } from "../brands.service";
import { tuiTablePaginationOptionsProvider } from "@taiga-ui/addon-table";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { BrandModel } from "../../../shared/models/brand.model";
import { SubmitService } from "../../../shared/services/submit.service";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { BrandDialogComponent } from "./brand-dialog/brand-dialog.component";

@Component({
  selector: 'app-brands-list',
  templateUrl: './brands-list.component.html',
  styleUrls: ['./brands-list.component.scss'],
  providers: [
    tuiTablePaginationOptionsProvider({
      showPages: true,
    }),
  ],
})
export class BrandsListComponent implements OnInit {
  public page = 0;
  public size = 10;
  public brandsData: ApiDataModel<BrandModel[]>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Бренды`,
      routerLink: `/brands`,
    },
  ];

  readonly columns = ['name', 'origin', 'description'];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private brandsService: BrandsService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.brandsData = undefined;
    this.brandsService.getBrands().subscribe((res: BrandModel[] | null) => {
      this.brandsData = res;
    });
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<BrandModel | null>(
      new PolymorpheusComponent(BrandDialogComponent, this.injector),
      {
        label: 'Бренд',
      }
    );
    dialog.subscribe({
      next: (data: BrandModel | null) => {
        if (data) {
          this.alertService.open(`Бренд ${data.name} создан`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(brand: BrandModel): void {
    const dialog = this.dialogService.open<BrandModel | null>(
      new PolymorpheusComponent(BrandDialogComponent, this.injector),
      {
        label: 'Бренд',
        data: brand,
      }
    );
    dialog.subscribe({
      next: (data: BrandModel | null) => {
        if (data) {
          this.alertService.open(brand.name === data.name ? `Бренд ${brand.name} изменен` : `Бренд ${brand.name} изменен. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить бренд: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.brandsService.deleteBrand(id).subscribe(() => {
            this.alertService.open(`Бренд ${title} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
            this.refreshData();
          });
        }
      },
    })
  }

}
