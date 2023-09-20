import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { AddArticleRequestDto, ArticleResponseDto, UpdateArticleRequestDto } from "../../../shared/dto/article.dto";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NewsService } from "../news.service";
import { ImagesService } from "../../../shared/services/images.service";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";
import { TuiFileLike } from "@taiga-ui/kit";
import {
  createImageEditorExtension, defaultEditorExtensions,
  TUI_EDITOR_CONTENT_PROCESSOR,
  TUI_EDITOR_EXTENSIONS,
  TUI_IMAGE_LOADER,
  tuiLegacyEditorConverter
} from "@taiga-ui/addon-editor";
import { EDITOR_TOOLS } from "./editor-tools.const";
import { map, Observable, of, switchMap } from "rxjs";
import { ResultMediaData } from "../../../shared/models/images.model";
import * as randomBytes from "randombytes";
import { SubmitService } from "../../../shared/services/submit.service";
import { imageLoader } from "./image-loader";

@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.scss'],
  providers: [
    {
      provide: TUI_EDITOR_EXTENSIONS,
      deps: [Injector],
      useFactory: (injector: Injector) => [
        import('@taiga-ui/addon-editor/extensions/image-editor').then(
          ({createImageEditorExtension}) =>
            createImageEditorExtension(injector),
        ),
        ...defaultEditorExtensions,
      ],
    },
    {
      provide: TUI_EDITOR_CONTENT_PROCESSOR,
      useValue: tuiLegacyEditorConverter,
    },
    {
      provide: TUI_IMAGE_LOADER,
      useFactory: imageLoader,
      deps: [ImagesService],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsDetailsComponent implements OnInit {
  public breadcrumbs;
  public articleId;
  public articleData: ApiDataModel<ArticleResponseDto>;
  public initialMedia: ApiDataModel<string>;
  public loading = false;
  public editorTools = EDITOR_TOOLS;

  public formGroup: FormGroup = this.formBuilder.group({
    title: [null],
    description: [null, Validators.required],
    content: ['', Validators.required],
    media: [null, Validators.required],
    tags: [[]],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private newsService: NewsService,
    private imagesService: ImagesService,
    private submitService: SubmitService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) {
    this.articleId = this.route.snapshot.params['id'];
    this.breadcrumbs = [
      {
        caption: `Главная`,
        routerLink: `/`,
      },
      {
        caption: `Новости`,
        routerLink: `/news`,
      },
      {
        caption: `${!this.articleId ? 'Новый пост' : 'Детали'}`,
        routerLink: `/news/details/${this.articleId}`,
      }
    ];
  }

  ngOnInit(): void {
    this.refreshData();
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  public onReject(files: TuiFileLike | readonly TuiFileLike[]): void {
    this.alertService.open([...(files as TuiFileLike[])].map(item => item.name)[0], {label: `Ошибка загрузки изображения`, status: TuiNotification.Error, autoClose: 5000}).subscribe();
  }

  public removeFile({name}: File): void {
    this.f['media'].setValue(null);
  }

  public submit(): void {
    this.formGroup.markAsTouched();
    if (this.formGroup.valid) {
      const data = this.formGroup.value;
      this.loading = true;
      this.processMedia(this.initialMedia, data.media, !this.articleId).subscribe((resMediaPayload: string) => {
        const payload = {
          ...data,
          media: resMediaPayload,
        };
        if (this.articleId) {
          this.newsService.updateArticle(this.articleId.toString(), payload as UpdateArticleRequestDto).subscribe(
            res => {
              if (res) {
                this.alertService.open(`Пост ${res.title} обновлён`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/news/list']);
              }
            },
            err => {
              this.loading = false;
            }
          );
        } else {
          this.newsService.addArticle(payload as AddArticleRequestDto).subscribe(
            res => {
              if (res) {
                this.alertService.open(`Пост ${res.title} добавлен`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/news/list']);
              }
            },
            err => {
              this.loading = false;
            }
          );
        }
      });
    }
  }

  public refreshData(): void {
    if (this.articleId) {
      this.articleData  = undefined;
      this.formGroup.reset();
      this.newsService.getArticleById(this.articleId).subscribe((res: ArticleResponseDto | null) => {
        this.articleData = res || null;
        if (res) {
          this.initialMedia = res.media || null;
          this.imagesService.getImage(res.media).subscribe((mediaRes: TuiFileLike | null) => {
            setTimeout(() => {
              this.formGroup.setValue({
                title: res.title,
                description: res.description,
                content: res.content,
                media: mediaRes || null,
                tags: res.tags,
              })
            });
          });
        }
      });
    }
  }

  public showDeleteDialog(): void {
    if (this.articleData) {
      this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить новость: ${this.articleData.title}?`).subscribe({
        next: (res) => {
          if (res && this.articleData) {
            this.loading = true;
            this.newsService.deleteArticle(this.articleData._id).subscribe((res) => {
              if (this.articleData && res) {
                this.alertService.open(`Новость ${this.articleData.title} удалена`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/news']);
              }
            });
          }
        },
      })
    }
  }

  private processMedia(initialName: string | undefined | null, resultMedia: TuiFileLike, newArticle?: boolean): Observable<string> {
    if (newArticle || !initialName) {
      const resultMediaData: ResultMediaData = this.generateMediaData(resultMedia);
      return this.imagesService.addImages([resultMediaData]).pipe(map(res => res[0].name));
    } else {
      if (initialName === resultMedia.name) {
        return of(resultMedia.name);
      } else {
        const resultMediaData: ResultMediaData = this.generateMediaData(resultMedia);
        return this.imagesService.addImages([resultMediaData]).pipe(
          map(res => res[0].name),
          switchMap(
            (addResFileName: string) => addResFileName ?
              this.imagesService.deleteImage(initialName).pipe(map(() => addResFileName))
              : of(initialName)
          )
        )
      }
    }
  }

  private generateMediaData(media: TuiFileLike): ResultMediaData {
    const shortName: string = randomBytes(7).toString('hex');
    return  {
      file: media,
      name: `${shortName}.${media.name.split('.')[1]}`,
      newShortName: shortName,
    }
  }

}
