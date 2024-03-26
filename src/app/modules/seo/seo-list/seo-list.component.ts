import { Component, Inject, Injector, OnInit } from '@angular/core';
import { tuiTablePaginationOptionsProvider } from "@taiga-ui/addon-table";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { SubmitService } from "../../../shared/services/submit.service";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { SeoDialogComponent } from "./seo-dialog/seo-dialog.component";
import { SeoModel } from "../../../shared/models/seo.model";
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-seo-list',
  templateUrl: './seo-list.component.html',
  styleUrls: ['./seo-list.component.scss'],
  providers: [
    tuiTablePaginationOptionsProvider({
      showPages: true,
    }),
  ],
})
export class SeoListComponent implements OnInit {
  public page = 0;
  public size = 10;
  public seoData: ApiDataModel<SeoModel[]>;

  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `SEO`,
      routerLink: `/seo`,
    },
  ];

  readonly columns = ['title', 'description', 'keywords', 'tag', 'content', 'url'];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private seoService: SeoService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.seoData = undefined;
    this.seoService.getAllSeo().subscribe((res: SeoModel[] | null) => {
      this.seoData = res;
    });
  }

  public showAddDialog(): void {
    const dialog = this.dialogService.open<SeoModel | null>(
      new PolymorpheusComponent(SeoDialogComponent, this.injector),
      {
        label: 'SEO',
        size: 'l',
      }
    );
    dialog.subscribe({
      next: (data: SeoModel | null) => {
        if (data) {
          this.alertService.open(`Поле ${data.title} создао`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(seo: SeoModel): void {
    const dialog = this.dialogService.open<SeoModel | null>(
      new PolymorpheusComponent(SeoDialogComponent, this.injector),
      {
        label: 'SEO',
        size: 'l',
        data: seo,
      }
    );
    dialog.subscribe({
      next: (data: SeoModel | null) => {
        if (data) {
          this.alertService.open(`Поле ${seo.title} изменено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить поле: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.seoService.deleteSeo(id).subscribe(() => {
            this.alertService.open(`Поле ${title} удалено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
            this.refreshData();
          });
        }
      },
    })
  }

}
