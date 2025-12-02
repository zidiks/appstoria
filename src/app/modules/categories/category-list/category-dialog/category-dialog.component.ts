import { Component, Inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiAlertService, TuiDialogContext, TuiNotification, TuiValueContentContext } from "@taiga-ui/core";
import { CategoryLinearModel, CategoryModel } from "../../../../shared/models/category.model";
import { CategoryDialogDataModel } from "../../../../shared/models/category-dialog-data.model";
import { TypesService } from "../../../types/types.service";
import { forkJoin, map, Observable, of, switchMap } from "rxjs";
import { ProductTypePrevModel } from "../../../../shared/models/type-property.model";
import { EMPTY_ARRAY, TuiContextWithImplicit, TuiHandler, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { CategoriesService } from "../../categories.service";
import { ApiDataModel } from "../../../../shared/models/api-data.model";
import { EditorMode } from "../../../../shared/enums/editor-mode.enum";
import { EDITOR_TOOLS } from "../../../news/news-details/editor-tools.const";
import {
  defaultEditorExtensions,
  TUI_EDITOR_CONTENT_PROCESSOR,
  TUI_EDITOR_EXTENSIONS,
  TUI_IMAGE_LOADER,
  tuiLegacyEditorConverter
} from "@taiga-ui/addon-editor";
import { imageLoader } from "../../../news/news-details/image-loader";
import { ImagesService } from "../../../../shared/services/images.service";
import { TuiFileLike } from "@taiga-ui/kit";
import { ResultMediaData } from "../../../../shared/models/images.model";
import * as randomBytes from "randombytes";

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss'],
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
})
export class CategoryDialogComponent implements OnInit {
  public typesData: ApiDataModel<ProductTypePrevModel[]>;
  public categoriesTreeData: ApiDataModel<CategoryModel>;
  public linearCategoriesData: CategoryLinearModel[] = [];
  public loading = false;
  public editorMode: EditorMode = EditorMode.advanced;
  protected readonly EditorMode = EditorMode;

  public formGroup: FormGroup = this.formBuilder.group( {
    parent: [ this.parentData?._id || this.categoryData?.parent?._id || null ],
    name: [ this.categoryData?.name, Validators.required ],
    handle: [ this.categoryData?.handle?.split('/').slice(-1), Validators.required ],
    title: [ this.categoryData?.title, Validators.required ],
    description: [ this.categoryData?.description ],
    content: [ this.categoryData?.content ],
    keywords: [ this.categoryData?.keywords || [] ],
    type: [ this.categoryData?.productTypeId ],
    icon: [ this.categoryData?.icon ],
    media: [ null ],
    isHidden: [ this.categoryData?.isHidden || false ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, CategoryDialogDataModel>,
    private formBuilder: FormBuilder,
    private typesService: TypesService,
    private categoriesService: CategoriesService,
    private imagesService: ImagesService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  public ngOnInit(): void {
    this.typesService.getTypes().subscribe(res => this.typesData = res);
    this.categoriesService.getCategoriesTree().subscribe((res: CategoryModel | null) => {
      this.categoriesTreeData = res;
      if (res) {
        this.linearCategoriesData = this.linearCategory([res]);
      }
    });

    const initialMediaName = this.categoryData?.media && this.categoryData.media.length
      ? this.categoryData.media[0]
      : undefined;

    if (initialMediaName) {
      this.imagesService.getImage(initialMediaName).subscribe((mediaRes: TuiFileLike | null) => {
        if (mediaRes) {
          this.f['media'].setValue(mediaRes);
        } else {
          this.alertService.open('Невозможно загрузить изображение', {
            label: `Ошибка загрузки`,
            status: TuiNotification.Warning,
            autoClose: 3000,
          }).subscribe();
        }
      });
    }
  }

  public setEditorMode(mode: EditorMode): void {
    this.editorMode = mode;
  }

  @tuiPure
  public stringify(
    items: ProductTypePrevModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({_id, name}) => [_id, name] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  get categoryData(): Partial<CategoryModel> | undefined {
    return this.context.data.categoryData;
  }

  get parentData(): CategoryModel | undefined {
    return this.context.data.parentData;
  }

  public get typeListData(): Observable<ProductTypePrevModel[] | null> {
    return this.typesService.getTypes();
  }

  public changeSlug(value: string): void {
    this.f['handle']?.setValue(value);
  }

  public get parentSlug(): string {
    const parent = this.parentData;
    if (!parent?.handle) {
      return '';
    }
    return parent.handle === 'root' ? '' : `${parent.handle}/`;
  }

  public submit(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.formGroup.value;
    const currentMedia: TuiFileLike | null = this.f['media'].value;
    const initialMediaName: string | undefined =
      this.categoryData?.media && this.categoryData.media.length
        ? this.categoryData.media[0]
        : undefined;

    this.processMedia(initialMediaName, currentMedia).subscribe({
      next: (mediaNames: string[]) => {
        if (this.categoryData?._id) {
          const requests: Observable<CategoryModel | CategoryModel[] | null>[] = [
            this.categoriesService.updateCategory(this.categoryData._id, {
              name: formValue.name,
              handle: this.parentSlug + formValue.handle,
              title: formValue.title,
              description: formValue.description,
              content: formValue.content,
              keywords: formValue.keywords,
              media: mediaNames,
              icon: formValue.icon || '',
              children: this.categoryData?.children?.map(item => item._id) || [],
              productTypeId: formValue.type,
              isHidden: formValue.isHidden,
            })
          ];
          if (this.parentData?._id !== formValue.parent && formValue.parent && !this.categoryData.root) {
            requests.push(this.categoriesService.moveCategory(this.categoryData._id, formValue.parent));
          }
          forkJoin(requests).subscribe(
            res => {
              this.loading = false;
              this.context.completeWith(res[0]);
            },
            err => {
              this.loading = false;
              this.context.completeWith(null);
            },
          );
        } else {
          this.categoriesService.addCategory({
            parent: formValue.parent,
            name: formValue.name,
            handle: this.parentSlug + formValue.handle,
            title: formValue.title,
            description: formValue.description,
            content: formValue.content,
            keywords: formValue.keywords,
            media: mediaNames,
            icon: formValue.icon || '',
            productTypeId: formValue.type,
            isHidden: formValue.isHidden,
            root: this.parentData || formValue.parent ? undefined : true,
          }).subscribe(
            res => {
              this.loading = false;
              this.context.completeWith(res);
            },
            err => {
              this.loading = false;
              this.context.completeWith(null);
            },
          );
        }
      },
      error: () => {
        this.loading = false;
        this.context.completeWith(null);
      }
    });
  }

  public onReject(files: TuiFileLike | readonly TuiFileLike[]): void {
    this.alertService.open(
      [...(files as TuiFileLike[])].map(item => item.name)[0],
      { label: `Ошибка загрузки изображения`, status: TuiNotification.Error, autoClose: 5000 },
    ).subscribe();
  }

  public removeFile({ name }: File): void {
    this.f['media'].setValue(null);
  }

  private processMedia(initialName: string | undefined, resultMedia: TuiFileLike | null): Observable<string[]> {
    if (!resultMedia) {
      if (initialName) {
        return this.imagesService.deleteImage(initialName).pipe(map(() => []));
      }

      return of([]);
    }

    if (!initialName) {
      const resultMediaData: ResultMediaData = this.generateMediaData(resultMedia);
      return this.imagesService.addImages([resultMediaData]).pipe(
        map(res => [res[0].name]),
      );
    }

    if (initialName === resultMedia.name) {
      return of([initialName]);
    } else {
      const resultMediaData: ResultMediaData = this.generateMediaData(resultMedia);
      return this.imagesService.addImages([resultMediaData]).pipe(
        map(res => res[0].name),
        switchMap(
          (addResFileName: string) => addResFileName ?
            this.imagesService.deleteImage(initialName).pipe(map(() => [addResFileName]))
            : of([initialName]),
        ),
      );
    }
  }

  private generateMediaData(media: TuiFileLike): ResultMediaData {
    const shortName: string = randomBytes(7).toString('hex');
    return {
      file: media,
      name: `${shortName}.${media.name.split('.')[1]}`,
      newShortName: shortName,
    };
  }

  readonly categoryContent: TuiStringHandler<TuiValueContentContext<readonly unknown[]>> = ({$implicit}) => {
    const categoryItem = (this.linearCategoriesData || []).find((category => category._id === $implicit.toString()));
    if (categoryItem) {
      return categoryItem.name;
    }
    return 'Неизвестно';
  };

  private linearCategory(treeData: CategoryModel[]): CategoryLinearModel[] {
    const recursionFn = (linearTree: CategoryLinearModel[],categoryNode: CategoryModel): void => {
      linearTree.push({
        _id: categoryNode._id,
        name: categoryNode.name,
        productTypeId: categoryNode.productTypeId,
      });
      if (categoryNode.children?.length) {
        categoryNode.children.forEach((child: CategoryModel) => {
          recursionFn(linearTree, child);
        });
      }
    }
    const linearData: CategoryLinearModel[] = [];
    treeData.forEach((item: CategoryModel) => recursionFn(linearData, item));
    return linearData;
  }

  readonly categoryChildHandler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item =>
    this.categoryData?._id !== item._id ?
      item.children?.filter(subItem =>subItem._id !== this.categoryData?._id) || EMPTY_ARRAY
      : EMPTY_ARRAY;
  protected readonly editorTools = EDITOR_TOOLS;
}
