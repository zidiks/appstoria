import { Injectable } from '@angular/core';
import { GetProductsOptions, ProductModel, ProductPrevModel } from "../../shared/models/product.model";
import { Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { Paginated } from "../../shared/models/paginated.model";
import { AddProductDto, Autocomplete, UpdateProductDto } from "../../shared/dto/products.dto";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(
    private http: HttpService,
  ) { }

  public getProducts<T extends (ProductModel | ProductPrevModel)>(options?: GetProductsOptions): Observable<Paginated<T> | null> {
    return this.http.post<Paginated<T>, GetProductsOptions>(`store/products`, options);
  }

  public autocomplete(search: string): Observable<Autocomplete[] | null> {
    return this.http.get<Autocomplete[]>(`store/autocomplete/${search}`);
  }

  public getProductById(id: string): Observable<ProductModel | null> {
    return this.http.get<ProductModel>(`store/product/${id}`);
  }

  public addProduct(payload: AddProductDto): Observable<ProductModel | null> {
    return this.http.post<ProductModel, AddProductDto>('store/product', payload);
  }

  public deleteProduct(id: string): Observable<ProductModel | null> {
    return this.http.delete<ProductModel>('store/product', id);
  }

  public updateProduct(id: string, payload: UpdateProductDto): Observable<ProductModel | null> {
    return this.http.put<ProductModel, UpdateProductDto>('store/product', id, payload);
  }
}
