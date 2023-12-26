import {Injectable} from "@angular/core";
import {HttpService} from "../../../shared/services/http.service";
import {Observable} from "rxjs";
import {
  CurrencyConfigDto,
  CurrencyConfigResponseDto,
  UpdateCurrencyConfigRequestDto
} from "../../../shared/dto/currency-config.dto";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(
    private http: HttpService,
  ) { }

  public getCurrencyConfig(): Observable<CurrencyConfigResponseDto> {
    return this.http.get<CurrencyConfigResponseDto>('config/currency');
  }

  public updateCurrencyConfig(id: string, payload: CurrencyConfigDto): Observable<CurrencyConfigResponseDto | null> {
    return this.http.put<CurrencyConfigResponseDto, UpdateCurrencyConfigRequestDto>('config/currency', id, payload)
  }
}
