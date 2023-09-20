import { Injectable } from '@angular/core';
import { CategoryModel } from "../../shared/models/category.model";
import { Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { AddCategoryDto, UpdateCategoryDto } from "../../shared/dto/categories.dto";

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(
    private http: HttpService,
  ) { }

  public getCategories(): Observable<CategoryModel[] | null> {
    return this.http.get<CategoryModel[]>('store/category');
  }

  public getCategoriesTree(): Observable<CategoryModel | null> {
    return this.http.get<CategoryModel>('store/category/tree');
  }

  public addCategory(payload: AddCategoryDto): Observable<CategoryModel | null> {
    return this.http.post<CategoryModel, AddCategoryDto>('store/category', payload);
  }

  public updateCategory(id: string, payload: UpdateCategoryDto): Observable<CategoryModel | null> {
    return this.http.put<CategoryModel, UpdateCategoryDto>('store/category', id, payload);
  }

  public moveCategory(categoryId: string, toId: string): Observable<CategoryModel[] | null> {
    return this.http.patch<CategoryModel[], { categoryId: string; toId: string }>('store/category/move', {categoryId, toId});
  }

  public deleteCategory(id: string): Observable<CategoryModel | null> {
    return this.http.delete<CategoryModel>('store/category', id);
  }
}
