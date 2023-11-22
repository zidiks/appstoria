import { Component, Inject, OnInit } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { CategoryDialogDataModel } from "../../../../shared/models/category-dialog-data.model";
import { CategoryModel } from "../../../../shared/models/category.model";
import { CategoriesService } from "../../categories.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-category-reorder',
  templateUrl: './category-reorder.component.html',
  styleUrls: ['./category-reorder.component.scss']
})
export class CategoryReorderComponent implements OnInit {
  public categoriesList: CategoryModel[] = [];

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, CategoryDialogDataModel>,
    private categoriesService: CategoriesService,
  ) { }

  ngOnInit(): void {
    this.categoriesList = (this.parentData?.children || []).slice();
  }

  get parentData(): CategoryModel | undefined {
    return this.context.data.parentData;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categoriesList, event.previousIndex, event.currentIndex);
  }

  public submit(): void {
    const orderedCategories = this.categoriesList.map((item: CategoryModel, index: number) => ({
      ...item,
      order: index,
    }));
    console.log(orderedCategories);
    this.context.completeWith(true);
  }

}
