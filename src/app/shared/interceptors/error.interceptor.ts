import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpStatusCode } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from "../services/auth.service";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === HttpStatusCode.Unauthorized) {
        this.authenticationService.logout();
        location.reload();
      }

      const error = err.error.message || err.statusText;
      this.alertService.open(error, {label: `Ошибка`, status: TuiNotification.Error, autoClose: 5000}).subscribe();
      return throwError(error);
    }));
  }
}
