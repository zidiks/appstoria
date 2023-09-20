import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap, throwError } from "rxjs";
import { UserModel } from "../models/user.model";
import { Roles } from "../enums/roles.enum";
import { HttpService } from "./http.service";
import { GetCurrentUserResDto, LoginReqDto, LoginResDto } from "../dto/auth.dto";

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
    const storageUserToken: string | undefined = JSON.parse(localStorage.getItem('currentUser') || 'null')?.accessToken;
    if (storageUserToken) {
      return this.http.get<GetCurrentUserResDto>('auth').pipe(
        map((res: GetCurrentUserResDto) => {
          const newCurrentUserData: UserModel | null = res ? Object.assign(
            this.currentUserSubject.value || {},
            {
              id: res.userId,
              username: res.username,
              roles: res.roles,
              accessToken: res.accessToken,
            }) : null;
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
         };
         localStorage.setItem('currentUser', JSON.stringify(userData));
         this.currentUserSubject.next(userData);
         this.updCurrentUser().subscribe();
       }
        return user;
      }));
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    location.reload();
  }

  public softLogout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}
