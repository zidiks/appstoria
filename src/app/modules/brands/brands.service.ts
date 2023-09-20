import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { BrandModel } from "../../shared/models/brand.model";
import { HttpService } from "../../shared/services/http.service";
import { AddBrandDto, UpdateBrandDto } from "../../shared/dto/brands.dto";

@Injectable({
  providedIn: 'root'
})
export class BrandsService {

  constructor(
    private http: HttpService,
  ) { }

  public getBrands(): Observable<BrandModel[]> {
    return this.http.get<BrandModel[]>('store/brand');
  }

  public getBrandById(id: string): Observable<BrandModel> {
    return this.http.get<BrandModel>(`store/brand/${id}`);
  }

  public updateBrand(id: string, payload: UpdateBrandDto): Observable<BrandModel> {
    return this.http.put<BrandModel, UpdateBrandDto>(`store/brand`, id, payload);
  }

  public addBrand(payload: AddBrandDto): Observable<BrandModel> {
    return this.http.post<BrandModel, AddBrandDto>(`store/brand`, payload);
  }

  public deleteBrand(id: string): Observable<BrandModel> {
    return this.http.delete<BrandModel>(`store/brand`, id);
  }
}
