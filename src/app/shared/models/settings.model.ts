import { Type } from "@angular/core";

export interface SettingsItemModel {
  name: string;
  description: string;
  component: Type<any> | undefined;
  path: string;
  icon: string;
}
