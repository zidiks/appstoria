import { Injectable } from '@angular/core';
import {HttpService} from "../../../shared/services/http.service";
import {Observable} from "rxjs";
import {
  DiscountConfigDto,
  DiscountConfigResponseDto,
  UpdateDiscountConfigRequestDto
} from "../../../shared/dto/discount-config.dto";

@Injectable({
  providedIn: 'root'
})
export class DiscountService {

  constructor(
    private http: HttpService,
  ) { }

  public getDiscountConfig(): Observable<DiscountConfigResponseDto> {
    return this.http.get<DiscountConfigResponseDto>('config/discount');
  }

  public updateDiscountConfig(id: string, payload: DiscountConfigDto): Observable<DiscountConfigResponseDto | null> {
    return this.http.put<DiscountConfigResponseDto, UpdateDiscountConfigRequestDto>('config/discount', id, payload)
  }
}
