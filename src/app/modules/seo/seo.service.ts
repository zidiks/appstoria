import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpService } from "../../shared/services/http.service";
import { SeoModel } from 'src/app/shared/models/seo.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private http: HttpService,
  ) { }

  public getAllSeo(): Observable<SeoModel[]> {
    return this.http.get<SeoModel[]>('seo');
  }

  public getFieldByUrl(url: string): Observable<SeoModel> {
    return this.http.get<SeoModel>(`seo/${url}`);
  }

  public setSeo(payload: Partial<SeoModel>): Observable<SeoModel> {
    return this.http.post<SeoModel, Partial<SeoModel>>(`seo`, payload);
  }

  public deleteSeo(id: string): Observable<SeoModel> {
    return this.http.delete<SeoModel>(`seo`, id);
  }
}
