import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ProductTypeModel, ProductTypePrevModel } from "../../shared/models/type-property.model";
import { HttpService } from "../../shared/services/http.service";
import { AddTypeDto, UpdateTypeDto } from "../../shared/dto/types.dto";

@Injectable({
  providedIn: 'root'
})
export class TypesService {

  constructor(
    private http: HttpService,
  ) { }

  public getTypes(): Observable<ProductTypePrevModel[] | null> {
    return this.http.get<ProductTypePrevModel[]>('store/type/prev');
  }

  public getTypeById(id: string): Observable<ProductTypeModel | null> {
    return this.http.get<ProductTypeModel>(`store/type/${id}`);
  }

  public updateType(id: string, payload: UpdateTypeDto): Observable<ProductTypeModel | null> {
    return this.http.put<ProductTypeModel, UpdateTypeDto>(`store/type`, id, payload);
  }

  public addType(payload: AddTypeDto): Observable<ProductTypeModel | null> {
    return this.http.post<ProductTypeModel, AddTypeDto>('store/type', payload);
  }

  public deleteType(id: string): Observable<ProductTypeModel | null> {
    return this.http.delete<ProductTypeModel>('store/type', id);
  }
}
