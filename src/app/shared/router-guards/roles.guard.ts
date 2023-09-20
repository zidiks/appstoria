import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { Roles } from "../enums/roles.enum";
import { AuthService } from "../services/auth.service";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";
import { compareRoles } from "../functions/compare-roles.func";

export class RolesGuard {
  static forRoles(...requiredRoles: Roles[]) {
    @Injectable({
      providedIn: 'root'
    })
    class RolesCheck implements CanActivate {
      constructor(
        private authService: AuthService,
        @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
      ) {
      }
      canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
      ): Observable<boolean> {
        return this.authService.currentUser$.pipe(
          map(res => {
              if (res && compareRoles(requiredRoles, res.roles)) {
                return true;
              }
              this.alertService.open('Обратитесь к администратору', {label: `Недостаточно прав доступа`, status: TuiNotification.Error, autoClose: 7000}).subscribe();
              return false;
          }),
          take(1),
        )
      }
    }
    return RolesCheck;
  }
}
