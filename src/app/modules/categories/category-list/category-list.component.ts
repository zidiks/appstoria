import { Component, Inject, Injector, OnInit } from '@angular/core';
import { CategoryBaseModel, CategoryModel } from "../../../shared/models/category.model";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { CategoriesService } from "../categories.service";
import { EMPTY_ARRAY, TuiHandler } from "@taiga-ui/cdk";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { CategoryDialogComponent } from "./category-dialog/category-dialog.component";
import { setCategoryChildParent } from "../../../shared/functions/set-category-child-parent.func";
import { SubmitService } from "../../../shared/services/submit.service";

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  public categoriesData: ApiDataModel<CategoryModel>;
  public apiLoadingState = ApiLoadingState;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Категории`,
      routerLink: `/categories`,
    },
  ];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private categoriesService: CategoriesService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.categoriesData = undefined;
    this.categoriesService.getCategoriesTree().subscribe((res: CategoryModel | null) => {
      if (res) {
        setCategoryChildParent(res)
      }
      this.categoriesData = res;
    })
  }

  readonly handler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item => item.children || EMPTY_ARRAY;

  public showAddDialog(parent?: CategoryModel): void {
    const dialog = this.dialogService.open<CategoryBaseModel>(
      new PolymorpheusComponent(CategoryDialogComponent, this.injector),
      {
        label: 'Категория',
        data: { parentData: parent }
      }
    );
    dialog.subscribe({
      next: data => {
        if (data) {
          this.alertService.open(`Категория ${data.name} создана`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(category: CategoryModel, parent?: CategoryModel): void {
    const dialog = this.dialogService.open<CategoryBaseModel>(
      new PolymorpheusComponent(CategoryDialogComponent, this.injector),
      {
        label: 'Категория',
        data: {
          categoryData: category,
          parentData: parent
        }
      }
    );
    dialog.subscribe({
      next: data => {
        if (data) {
          this.alertService.open(category.name === data.name ? `Категория ${category.name} изменена` : `Категория ${category.name} изменена. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить категорию: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.categoriesService.deleteCategory(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Категория ${title} удалена`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }


}
