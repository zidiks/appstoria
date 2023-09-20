import { Roles } from "../enums/roles.enum";

export function compareRoles(requiredRoles: Roles[], userRoles: Roles[]): boolean {
  return userRoles.some((role: Roles) => requiredRoles.includes(role));
}
