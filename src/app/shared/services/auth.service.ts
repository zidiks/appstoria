import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, take, tap, throwError } from "rxjs";
import { UserModel } from "../models/user.model";
import { Roles } from "../enums/roles.enum";
import { HttpService } from "./http.service";
import {
  GetCurrentUserResDto,
  LoginReqDto,
  LoginResDto,
  RefreshTokenReqDto,
  RefreshTokenResDto,
} from "../dto/auth.dto";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserModel | null> = new BehaviorSubject<UserModel | null>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
  public currentUser$: Observable<UserModel | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpService,
  ) {
  }

  public get currentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  public updCurrentUser(): Observable<UserModel | null> {
    const storageUser: UserModel | null = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (storageUser?.accessToken) {
      return this.http.get<GetCurrentUserResDto>('auth').pipe(
        map((res: GetCurrentUserResDto) => {
          const newCurrentUserData: UserModel | null = res ? Object.assign(
            this.currentUserSubject.value || {},
            {
              id: res.userId || res.sub || storageUser.id,
              username: res.username,
              roles: res.roles,
              accessToken: res.accessToken || storageUser.accessToken,
              refreshToken: storageUser.refreshToken,
            }) : null;
          if (newCurrentUserData) {
            localStorage.setItem('currentUser', JSON.stringify(newCurrentUserData));
          }
          this.currentUserSubject.next(newCurrentUserData);
          return newCurrentUserData;
        })
      )
    } else {
      return throwError(new Error('Empty token'));
    }
  }

  public login(username: string, password: string): Observable<LoginResDto> {
    return this.http.post<LoginResDto, LoginReqDto>('auth/login', {username, password}).pipe(tap((user: LoginResDto) => {
       if (user?.roles.includes(Roles.User)) {
         const userData: UserModel = {
           id: user.sub,
           username: user.username,
           roles: user.roles,
           accessToken: user.accessToken,
           refreshToken: user.refreshToken,
         };
         localStorage.setItem('currentUser', JSON.stringify(userData));
         this.currentUserSubject.next(userData);
         this.updCurrentUser().subscribe();
       }
        return user;
      }));
  }

  public refreshAccessToken(): Observable<UserModel | null> {
    const currentUser = this.currentUserValue;
    if (!currentUser?.refreshToken) {
      return throwError(new Error('Empty refresh token'));
    }

    return this.http
      .post<RefreshTokenResDto, RefreshTokenReqDto>('auth/refresh', {
        refreshToken: currentUser.refreshToken,
      })
      .pipe(
        map((res: RefreshTokenResDto) => {
          const userData: UserModel = {
            id: res.sub,
            username: res.username,
            roles: res.roles,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
          return userData;
        }),
      );
  }

  public logout(): void {
    const refreshToken = this.currentUserValue?.refreshToken;
    if (!refreshToken) {
      this.clearCurrentUser(true);
      return;
    }

    this.http
      .post<{ success: boolean }, RefreshTokenReqDto>('auth/logout', {
        refreshToken,
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.clearCurrentUser(true),
        error: () => this.clearCurrentUser(true),
      });
  }

  public softLogout(): void {
    this.clearCurrentUser(false);
  }

  private clearCurrentUser(reload: boolean): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    if (reload) {
      location.reload();
    }
  }
}
