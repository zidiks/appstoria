import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse, HttpStatusCode,
} from '@angular/common/http';
import { delay, Observable, of, timeout, TimeoutError } from 'rxjs';
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";

@Injectable()
export class HttpControlInterceptor implements HttpInterceptor {
  constructor(
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      delay(300),
      timeout(environment.httpRequestTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          this.alertService.open(
            `Время ожидания запроса истекло \n ${request.url}`,
            {
              label: `Ошибка`,
              status: TuiNotification.Error,
              autoClose: 5000
            }).subscribe();
        }
        return of(new HttpResponse({
          body: null,
          status: HttpStatusCode.RequestTimeout,
        }));
      }),
    );
  }
}
