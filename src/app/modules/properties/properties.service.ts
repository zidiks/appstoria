import { Injectable } from '@angular/core';
import { ProductTypePropertyModel } from "../../shared/models/type-property.model";
import { map, Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { AddPropertyDto, UpdatePropertyDto } from "../../shared/dto/properties.dto";

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  constructor(
    private http: HttpService,
  ) { }

  public getProperties(): Observable<ProductTypePropertyModel[]> {
    return this.http.get<ProductTypePropertyModel[]>('store/property');
  }

  public getPropertiesByIds(ids: string[]): Observable<ProductTypePropertyModel[]> {
    return this.getProperties().pipe(
      map((properties: ProductTypePropertyModel[]) => {
        return properties.filter((property: ProductTypePropertyModel) => ids.includes(property._id));
      })
    )
  }

  public getPropertyById(id: string): Observable<ProductTypePropertyModel> {
    return this.http.get<ProductTypePropertyModel>(`store/property/${id}`);
  }

  public addProperty(payload: AddPropertyDto): Observable<ProductTypePropertyModel> {
    return this.http.post<ProductTypePropertyModel, AddPropertyDto>('store/property', payload);
  }

  public updateProperty(id: string, payload: UpdatePropertyDto): Observable<ProductTypePropertyModel> {
    return this.http.put<ProductTypePropertyModel, UpdatePropertyDto>('store/property', id, payload);
  }

  public deleteProperty(id: string): Observable<ProductTypePropertyModel> {
    return this.http.delete<ProductTypePropertyModel>(`store/property`, id);
  }
}
