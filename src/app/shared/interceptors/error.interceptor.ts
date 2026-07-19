import { Inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpStatusCode } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
      const isLoginRequest = request.url.includes('/auth/login');
      const isRefreshRequest = request.url.includes('/auth/refresh');

      if (
        err.status === HttpStatusCode.Unauthorized &&
        !isLoginRequest &&
        !isRefreshRequest
      ) {
        return this.authenticationService.refreshAccessToken().pipe(
          switchMap((user) => {
            if (!user?.accessToken) {
              return throwError(() => err);
            }

            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${user.accessToken}`,
              },
            });

            return next.handle(retryRequest);
          }),
          catchError((refreshErr) => {
            this.authenticationService.softLogout();
            location.reload();
            return throwError(() => refreshErr);
          }),
        );
      }

      if (err.status === HttpStatusCode.Unauthorized && isRefreshRequest) {
        this.authenticationService.softLogout();
        location.reload();
      }

      const error = err.error?.message || err.statusText;
      this.alertService.open(error, {label: `Ошибка`, status: TuiNotification.Error, autoClose: 5000}).subscribe();
      return throwError(() => err);
    }));
  }
}
