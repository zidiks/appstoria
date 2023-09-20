import { CategoryModel } from "../models/category.model";

export const setCategoryChildParent = (category: CategoryModel): void => {
  category.children?.forEach((child: CategoryModel) => {
    child.parent = {
      _id: category._id,
      name: category.name,
      handle: category.handle,
      description: category.description,
    };
    if (child.children?.length) {
      setCategoryChildParent(child);
    }
  });
}
