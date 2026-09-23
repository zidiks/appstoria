import { MenuModel } from "../models/menu.model";

export const setMenuChildParent = (menu: MenuModel): void => {
  menu.children?.forEach((child: MenuModel) => {
    child.parent = {
      _id: menu._id,
      name: menu.name,
      handle: menu.handle,
      description: menu.description,
    };
    if (child.children?.length) {
      setMenuChildParent(child);
    }
  });
}
