import { Route } from "@angular/router";
import { settingsList } from "../../modules/settings/settings-list/settings.const";

export function settingsRoutes(): Route[] {
  return settingsList.map(({path, component}) => ({path, component}));
}
