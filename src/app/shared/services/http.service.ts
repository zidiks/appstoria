import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly url: string;

  constructor(
    private httpClient: HttpClient,
  ) {
    this.url = `${environment.https ? 'https' : 'http'}://${environment.currentOrigin ? window.location.hostname : environment.host}:${environment.port}`;
  }

  public get<T>(endpoint: string, parameters?: { [key: string]: any }): Observable<T> {
    if (parameters) {
      const params: HttpParams = new HttpParams({ fromObject: parameters });
      return this.httpClient.get<T>(`${this.url}/${endpoint}`, { params });
    }
    return this.httpClient.get<T>(`${this.url}/${endpoint}`);
  }

  public getImage(endpoint: string): Observable<Blob> {
    return this.httpClient.get(`${this.url}/${endpoint}`, { responseType: 'blob' });
  }

  public post<T, K>(endpoint: string, payload?: K): Observable<T> {
    return this.httpClient.post<T>(`${this.url}/${endpoint}`, payload);
  }

  public delete<T>(endpoint: string, id: string | number): Observable<T> {
    return this.httpClient.delete<T>(`${this.url}/${endpoint}/${id}`);
  }

  public put<T, K>(endpoint: string, id: string | number, payload: K): Observable<T> {
    return this.httpClient.put<T>(`${this.url}/${endpoint}/${id}`, payload);
  }

  public patch<T, K>(endpoint: string, payload: K): Observable<T> {
    return this.httpClient.patch<T>(`${this.url}/${endpoint}`, payload);
  }
}
