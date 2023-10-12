import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiValueContentContext } from "@taiga-ui/core";
import { forkJoin, Observable } from "rxjs";
import { ProductTypePrevModel } from "../../../../shared/models/type-property.model";
import { EMPTY_ARRAY, TuiContextWithImplicit, TuiHandler, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { MenusService } from "../../menus.service";
import { ApiDataModel } from "../../../../shared/models/api-data.model";
import { MenuLinearModel, MenuModel } from 'src/app/shared/models/menu.model';
import { MenuDialogDataModel } from "../../../../shared/models/menu-dialog.model";

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss']
})
export class MenuDialogComponent implements OnInit {
  public menusTreeData: ApiDataModel<MenuModel>;
  public linearMenusData: MenuLinearModel[] = [];
  public loading = false;

  public formGroup: FormGroup = this.formBuilder.group( {
    parent: [ this.parentData?._id || this.menuData?.parent?._id || null ],
    name : [ this.menuData?.name, Validators.required ],
    handle : [ this.menuData?.handle, Validators.required ],
    description : [ this.menuData?.description ],
    code: [ this.menuData?.code, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, MenuDialogDataModel>,
    private formBuilder: FormBuilder,
    private menusService: MenusService,
  ) { }

  public ngOnInit(): void {
    this.menusService.getMenusTree().subscribe((res: MenuModel | null) => {
      this.menusTreeData = res;
      if (res) {
        this.linearMenusData = this.linearMenu([res]);
      }
    });
  }

  @tuiPure
  public stringify(
    items: ProductTypePrevModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({_id, name}) => [_id, name] as [string, string]));
    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  get menuData(): Partial<MenuModel> | undefined {
    return this.context.data.menuData;
  }

  get parentData(): MenuModel | undefined {
    return this.context.data.parentData;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const formValue = this.formGroup.value;
      if (this.menuData?._id) {
        const requests: Observable<MenuModel | MenuModel[] | null>[] = [
          this.menusService.updateMenu(this.menuData._id, {
            name: formValue.name,
            handle: formValue.handle,
            description: formValue.description,
            media: this.menuData?.media || [],
            children: this.menuData?.children?.map(item => item._id) || [],
            code: formValue.code,
          })
        ];
        if (this.parentData?._id !== formValue.parent && formValue.parent && !this.menuData.root) {
          requests.push(this.menusService.moveMenu(this.menuData._id, formValue.parent));
        }
       forkJoin(requests).subscribe(
          res => this.context.completeWith(res[0]),
          err => this.context.completeWith(null),
        );
      } else {
        this.menusService.addMenu({
          parent: formValue.parent,
          name: formValue.name,
          handle: formValue.handle,
          description: formValue.description,
          media: [],
          code: formValue.code,
          root: this.parentData || formValue.parent ? undefined : true,
        }).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

  readonly menuContent: TuiStringHandler<TuiValueContentContext<readonly unknown[]>> = ({$implicit}) => {
    const menuItem = (this.linearMenusData || []).find((menu => menu._id === $implicit.toString()));
    if (menuItem) {
      return menuItem.name;
    }
    return 'Неизвестно';
  };

  private linearMenu(treeData: MenuModel[]): MenuLinearModel[] {
    const recursionFn = (linearTree: MenuLinearModel[],menuNode: MenuModel): void => {
      linearTree.push({
        _id: menuNode._id,
        name: menuNode.name,
      });
      if (menuNode.children?.length) {
        menuNode.children.forEach((child: MenuModel) => {
          recursionFn(linearTree, child);
        });
      }
    }
    const linearData: MenuLinearModel[] = [];
    treeData.forEach((item: MenuModel) => recursionFn(linearData, item));
    return linearData;
  }

  readonly menuChildHandler: TuiHandler<MenuModel, readonly MenuModel[]> = item =>
    this.menuData?._id !== item._id ?
      item.children?.filter(subItem =>subItem._id !== this.menuData?._id) || EMPTY_ARRAY
      : EMPTY_ARRAY;
}
