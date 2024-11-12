import { Component, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ArticleResponseDto, getArticlesOptions } from "../../../shared/dto/article.dto";
import { NewsService } from "../news.service";
import { Paginated } from "../../../shared/models/paginated.model";
import { BehaviorSubject, combineLatest, debounceTime } from "rxjs";

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit {
  readonly limit$ = new BehaviorSubject<number>(10);
  readonly page$ = new BehaviorSubject<number>(0);
  readonly request$ = combineLatest({
    page: this.page$,
    limit: this.limit$,
  }).pipe(
    debounceTime(0),
  );
  public articlesData: ApiDataModel<Paginated<ArticleResponseDto>>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Новости`,
      routerLink: `/news`,
    },
  ];

  readonly columns = ['title', 'date', 'tags', 'seoTags'];

  constructor(
    private newsService: NewsService,
  ) { }

  ngOnInit(): void {
    this.refreshData();

    this.request$.subscribe(res => {
      this.refreshData(res);
    })
  }

  public changeSize(limit: number): void {
    this.limit$.next(limit);
  }

  public changePage(page: number): void {
    console.log(page)
    this.page$.next(page);
  }

  public refreshData(options?: getArticlesOptions): void {
    this.articlesData = undefined;
    this.newsService.getArticles(options).subscribe((res: Paginated<ArticleResponseDto> | null) => {
      this.articlesData = res || null;
    });
  }

}
