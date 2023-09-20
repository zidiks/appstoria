import { Roles } from "../enums/roles.enum";

export interface UserModel {
  id: string;
  username: string;
  roles: Roles[],
  accessToken?: string;
}
