import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { MenusService } from "../menus.service";
import { EMPTY_ARRAY, TuiHandler } from "@taiga-ui/cdk";
import { ApiLoadingState } from "../../../shared/enums/api-loading-state.enum";
import { TuiAlertService, TuiDialogService, TuiNotification } from "@taiga-ui/core";
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { MenuDialogComponent } from "./menu-dialog/menu-dialog.component";
import { SubmitService } from "../../../shared/services/submit.service";
import { MenuBaseModel, MenuModel } from "../../../shared/models/menu.model";
import { setMenuChildParent } from "../../../shared/functions/set-menu-child-parent.func";

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent implements OnInit {
  public menusData: ApiDataModel<MenuModel>;
  public apiLoadingState = ApiLoadingState;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Меню`,
      routerLink: `/menus`,
    },
  ];

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(Injector) private readonly injector: Injector,
    private menusService: MenusService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.menusData = undefined;
    this.menusService.getMenusTree().subscribe((res: MenuModel | null) => {
      if (res) {
        setMenuChildParent(res)
      }
      this.menusData = res;
    })
  }

  readonly handler: TuiHandler<MenuModel, readonly MenuModel[]> = item => item.children || EMPTY_ARRAY;

  public showAddDialog(parent?: MenuModel): void {
    const dialog = this.dialogService.open<MenuBaseModel>(
      new PolymorpheusComponent(MenuDialogComponent, this.injector),
      {
        label: 'Меню',
        data: { parentData: parent }
      }
    );
    dialog.subscribe({
      next: data => {
        if (data) {
          this.alertService.open(`Меню ${data.name} создано`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  public showEditDialog(menu: MenuModel, parent?: MenuModel): void {
    const dialog = this.dialogService.open<MenuBaseModel>(
      new PolymorpheusComponent(MenuDialogComponent, this.injector),
      {
        label: 'Меню',
        data: {
          menuData: menu,
          parentData: parent
        }
      }
    );
    dialog.subscribe({
      next: data => {
        if (data) {
          this.alertService.open(menu.name === data.name ? `Меню ${menu.name} изменено` : `Меню ${menu.name} изменено. Новое название ${data.name}`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
          this.refreshData();
        }
      },
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить меню: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.menusService.deleteMenu(id).subscribe((deleteRes) => {
            if (deleteRes) {
              this.alertService.open(`Меню ${title} удалено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
              this.refreshData();
            }
          });
        }
      },
    })
  }
}
