import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { UserModel } from "../models/user.model";
import { Roles } from "../enums/roles.enum";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UnauthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map((res: UserModel | null) => {
        if (res?.id && res.roles.includes(Roles.User)) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      }),
      take(1),
    )
  }

}
