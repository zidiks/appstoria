import { Injectable } from '@angular/core';
import { HttpService } from "../../shared/services/http.service";
import { Observable } from "rxjs";
import { AddArticleRequestDto, ArticleResponseDto, UpdateArticleRequestDto } from "../../shared/dto/article.dto";
import { Paginated } from "../../shared/models/paginated.model";

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(
    private http: HttpService,
  ) { }

  public getArticles(): Observable<Paginated<ArticleResponseDto> | null> {
    return this.http.get<Paginated<ArticleResponseDto>>('article');
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
