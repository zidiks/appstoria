import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { MenuModel } from 'src/app/shared/models/menu.model';
import { HttpService } from "../../shared/services/http.service";
import { AddMenuDto, UpdateMenuDto } from "../../shared/dto/menus.dto";

@Injectable({
  providedIn: 'root'
})
export class MenusService {
  constructor(private http: HttpService) {}

  public getMenus(): Observable<MenuModel[] | null> {
    return this.http.get<MenuModel[]>('store/menu');
  }

  public getMenusTree(): Observable<MenuModel | null> {
    return this.http.get<MenuModel>('store/menu/tree');
  }

  public addMenu(payload: AddMenuDto): Observable<MenuModel | null> {
    return this.http.post<MenuModel, AddMenuDto>('store/menu', payload);
  }

  public updateMenu(id: string, payload: UpdateMenuDto): Observable<MenuModel | null> {
    return this.http.put<MenuModel, UpdateMenuDto>('store/menu', id, payload);
  }

  public moveMenu(menuId: string, toId: string): Observable<MenuModel[] | null> {
    return this.http.patch<MenuModel[], { menuId: string; toId: string }>('store/menu/move', {menuId, toId});
  }

  public deleteMenu(id: string): Observable<MenuModel | null> {
    return this.http.delete<MenuModel>('store/menu', id);
  }
}
