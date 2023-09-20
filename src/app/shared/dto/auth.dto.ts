import { Roles } from "../enums/roles.enum";

export interface GetCurrentUserResDto {
  userId: string;
  username: string;
  roles: Roles[],
  accessToken: string;
}

export interface LoginReqDto {
  username: string;
  password: string;
}

export interface LoginResDto {
  username: string;
  sub: string;
  roles: Roles[],
  accessToken: string;
}
