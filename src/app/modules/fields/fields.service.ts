import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { FieldModel } from "../../shared/models/field.model";

@Injectable({
  providedIn: 'root'
})
export class FieldsService {

  constructor(
    private http: HttpService,
  ) { }

  public getFields(): Observable<FieldModel[]> {
    return this.http.get<FieldModel[]>('field');
  }

  public getFieldByCode(code: string): Observable<FieldModel> {
    return this.http.get<FieldModel>(`field/${code}`);
  }

  public setField(payload: Partial<FieldModel>): Observable<FieldModel> {
    return this.http.post<FieldModel, Partial<FieldModel>>(`field`, payload);
  }

  public deleteField(id: string): Observable<FieldModel> {
    return this.http.delete<FieldModel>(`field`, id);
  }
}
