import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpService } from "../../../shared/services/http.service";
import {
  MerchantImportPreviewDto,
  MerchantImportSourceDto,
  MerchantImportSourceResponseDto
} from "../../../shared/dto/merchant-import.dto";

const ENDPOINT = 'store/merchant-import';

@Injectable({
  providedIn: 'root'
})
export class MerchantImportService {

  constructor(
    private http: HttpService,
  ) { }

  public getSources(): Observable<MerchantImportSourceResponseDto[] | null> {
    return this.http.get<MerchantImportSourceResponseDto[]>(`${ENDPOINT}/sources`);
  }

  public addSource(payload: MerchantImportSourceDto): Observable<MerchantImportSourceResponseDto | null> {
    return this.http.post<MerchantImportSourceResponseDto, MerchantImportSourceDto>(`${ENDPOINT}/sources`, payload);
  }

  public updateSource(id: string, payload: MerchantImportSourceDto): Observable<MerchantImportSourceResponseDto | null> {
    return this.http.put<MerchantImportSourceResponseDto, MerchantImportSourceDto>(`${ENDPOINT}/sources`, id, payload);
  }

  public deleteSource(id: string): Observable<MerchantImportSourceResponseDto | null> {
    return this.http.delete<MerchantImportSourceResponseDto>(`${ENDPOINT}/sources`, id);
  }

  public runSource(id: string): Observable<MerchantImportSourceResponseDto | null> {
    return this.http.post<MerchantImportSourceResponseDto, {}>(`${ENDPOINT}/sources/${id}/run`, {});
  }

  public preview(url: string, markupPercent: number): Observable<MerchantImportPreviewDto> {
    return this.http.post<MerchantImportPreviewDto, { url: string, markupPercent: number }>(`${ENDPOINT}/preview`, { url, markupPercent });
  }
}
