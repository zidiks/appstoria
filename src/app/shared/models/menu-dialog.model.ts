import { MenuModel } from "./menu.model";

export interface MenuDialogDataModel {
  parentData?: MenuModel;
  menuData?: Partial<MenuModel>;
}
