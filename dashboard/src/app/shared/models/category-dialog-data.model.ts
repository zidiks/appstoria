import { CategoryModel } from "./category.model";

export interface CategoryDialogDataModel {
  parentData?: CategoryModel;
  categoryData?: Partial<CategoryModel>;
}
