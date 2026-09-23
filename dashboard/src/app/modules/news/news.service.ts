import { Injectable } from '@angular/core';
import { HttpService } from "../../shared/services/http.service";
import { Observable } from "rxjs";
import {
  AddArticleRequestDto,
  ArticleResponseDto,
  getArticlesOptions,
  UpdateArticleRequestDto
} from "../../shared/dto/article.dto";
import { Paginated } from "../../shared/models/paginated.model";

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(
    private http: HttpService,
  ) { }

  public getArticles(options?: getArticlesOptions): Observable<Paginated<ArticleResponseDto> | null> {
    const searchParams = new URLSearchParams({
      preview: 'true',
    });
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value.toString());
        }
      })
    }
    const queryString = searchParams.toString();
    return this.http.get<Paginated<ArticleResponseDto>>(`article${queryString ? `?${queryString}` : ''}`);
  }

  public getArticleById(id: string): Observable<ArticleResponseDto | null> {
    return this.http.get<ArticleResponseDto>(`article/${id}`);
  }

  public addArticle(payload: AddArticleRequestDto): Observable<ArticleResponseDto | null> {
    return this.http.post<ArticleResponseDto, AddArticleRequestDto>(`article`, payload);
  }

  public updateArticle(id: string, payload: AddArticleRequestDto): Observable<ArticleResponseDto | null> {
    return this.http.put<ArticleResponseDto, UpdateArticleRequestDto>(`article`, id, payload);
  }

  public deleteArticle(id: string): Observable<ArticleResponseDto | null> {
    return this.http.delete<ArticleResponseDto>('article', id);
  }
}
