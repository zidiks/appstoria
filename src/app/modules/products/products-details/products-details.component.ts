import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import {ProductModel, ProductPropertyValueModel, ProductSeoDto} from "../../../shared/models/product.model";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import { ProductsService } from "../products.service";
import { TypesService } from "../../types/types.service";
import { CategoryLinearModel, CategoryModel } from "../../../shared/models/category.model";
import { BrandModel } from "../../../shared/models/brand.model";
import {
  ProductTypeModel,
  ProductTypePrevModel,
  ProductTypePropertyModel
} from "../../../shared/models/type-property.model";
import {combineLatest, debounceTime, forkJoin, map, Observable, of, startWith, switchMap} from "rxjs";
import { BrandsService } from "../../brands/brands.service";
import { CategoriesService } from "../../categories/categories.service";
import { EMPTY_ARRAY, TuiContextWithImplicit, TuiHandler, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { TuiAlertService, TuiDialogService, TuiNotification, TuiValueContentContext } from "@taiga-ui/core";
import { maxFilesLength } from "../../../shared/functions/form-control-max-filex.func";
import { TuiFileLike } from "@taiga-ui/kit";
import { productPropertyControl } from "../../../shared/functions/product-property-control.func";
import { AddProductDto, UpdateProductDto } from "../../../shared/dto/products.dto";
import { PropertyValue } from "../../../shared/dto/properties.dto";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ImagesService } from "../../../shared/services/images.service";
import * as randomBytes from "randombytes";
import { ResultMediaData } from "../../../shared/models/images.model";
import { AddImagesResponseDto } from "../../../shared/dto/images.dto";
import { SubmitService } from "../../../shared/services/submit.service";
import { environment } from "../../../../environments/environment";
import { transliteration } from "../../../shared/functions/transliteration.func";
import {CurrencyService} from "../../settings/currency/currency.service";
import { floorRound } from "../../../shared/functions/floor-round.func";
import { EditorMode } from "../../../shared/enums/editor-mode.enum";
import { EDITOR_TOOLS } from "../../news/news-details/editor-tools.const";
import {
  defaultEditorExtensions,
  TUI_EDITOR_CONTENT_PROCESSOR,
  TUI_EDITOR_EXTENSIONS, TUI_IMAGE_LOADER,
  tuiLegacyEditorConverter
} from "@taiga-ui/addon-editor";
import { imageLoader } from "../../news/news-details/image-loader";
import { CurrencyConfigResponseDto } from "../../../shared/dto/currency-config.dto";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { ProductsListAdditionalComponent } from "../products-list-additional/products-list-additional.component";
import { ImageProcessingService } from "../../../shared/services/image-processing.service";
import { StoredImageResultDto } from "../../../shared/dto/image-processing.dto";

const MAX_MEDIA_LENGTH = 10;

interface DataResponse {
  product?: ProductModel | null;
  brands: BrandModel[] | null;
  categories: CategoryModel | null;
  productTypes: ProductTypePrevModel[] | null;
  seo?: ProductSeoDto | null;
}

@Component({
  selector: 'app-products-details',
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.scss'],
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
export class ProductsDetailsComponent implements OnInit {
  public breadcrumbs;
  public productId;
  public productData: ApiDataModel<ProductModel>;
  public brandsData: ApiDataModel<BrandModel[]>;
  public initialMedia: ApiDataModel<string[]>;
  public categoriesData: ApiDataModel<CategoryModel>;
  public productTypesPrevsData: ApiDataModel<ProductTypePrevModel[]>;
  public currentTypeData: ApiDataModel<ProductTypeModel>;
  public linearCategoriesData: CategoryLinearModel[] = [];
  public loading = false;
  public maxMediaLength = MAX_MEDIA_LENGTH;
  public currency = environment.currency;
  public prefix = '';
  public editorMode: EditorMode = EditorMode.advanced;
  /** Кропать новые картинки до квадрата при загрузке */
  public processOnUpload = true;
  protected readonly EditorMode = EditorMode;

  public formGroup: FormGroup = this.formBuilder.group({
    name: [null, Validators.required],
    media: [[], maxFilesLength(this.maxMediaLength)],
    price: [null],
    priceUSD: [null, Validators.required],
    totalPrice: [null, Validators.required],
    brand: [null, Validators.required],
    description: [null, Validators.required],
    content: [null],
    categoryId: [null],
    productTypeId: [null],
    isNew: [false, Validators.required],
    isRec: [false, Validators.required],
    isStock: [true, Validators.required],
    discount: [0, Validators.required],
    productProps: this.formBuilder.group({}),
    seo: this.formBuilder.group({
      seoTitle: [''],
      seoDescription: [''],
      seoKeywords: [[]],
      seoUrl: ['', Validators.required],
      seoImage: this.formBuilder.array([]),
    })
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private typesService: TypesService,
    private brandsService: BrandsService,
    private categoriesService: CategoriesService,
    private imagesService: ImagesService,
    private submitService: SubmitService,
    private currencyService: CurrencyService,
    private imageProcessingService: ImageProcessingService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    this.productId = this.route.snapshot.params['id'];
    this.breadcrumbs = [
      {
        caption: `Главная`,
        routerLink: `/`,
      },
      {
        caption: `Товары`,
        routerLink: `/products`,
      },
      {
        caption: `${!this.productId ? 'Новый товар' : 'Детали'}`,
        routerLink: `/products/details/${this.productId}`,
      }
    ];
  }

  public showAddProductAdditionalDialog(data: { productId: number }): void {
    const dialog = this.dialogService.open<CurrencyConfigResponseDto>(
      new PolymorpheusComponent(ProductsListAdditionalComponent, this.injector),
      {
        size: 'page',
        data,
      }
    );
    dialog.subscribe({
      next: (data: any) => {
        if (data && this.productData) {
          this.productData.associatedProducts = [...(this.productData.associatedProducts || []), data];
        }
      },
    });
  }

  public removeAssociatedProduct(i: number): void {
    if (!!this.productData?.associatedProducts?.length) {
      this.productData.associatedProducts.splice(i, 1);
    }
  }

  ngOnInit(): void {
    this.refreshData();
    combineLatest([
      this.f['discount'].valueChanges.pipe(startWith(0)),
      this.f['priceUSD'].valueChanges,
      this.f['price'].valueChanges.pipe(startWith(0)),
      this.currencyService.getCurrencyConfig(),
    ]).pipe(debounceTime(500)).subscribe(([rDiscount, rPriceUSD, rPrice, rCurrency]) => {
      const price = rPriceUSD ? rPriceUSD * rCurrency.currency : rPrice || 0;
      const discount = price * (rDiscount || 0) * 0.01;
      const totalPrice = floorRound(price - discount);
      if (rPriceUSD) {
        this.f['price'].setValue(floorRound(price));
      }
      this.f['totalPrice'].setValue(totalPrice);
    });
    this.f['productTypeId'].valueChanges.subscribe((value: string) => {
      if (value) {
        this.setPropertiesControls(value);
      }
    });
    this.f['categoryId'].valueChanges.subscribe((value: string) => {
      if (this.categoriesData) {
        const categoryItem = this.linearCategoriesData.find((category => category._id === value));
        if (categoryItem) {
          this.prefix = categoryItem.handle ? `${categoryItem.handle}/` : '';
          this.f['productTypeId'].setValue(categoryItem.productTypeId);
        }
      }
    });
  }

  /** Обработать все сохранённые изображения товара */
  public processImages(): void {
    if (!this.productId) {
      return;
    }
    this.imageProcessingService.processProduct(this.productId.toString(), this.productData?.name)
      .subscribe((changed: boolean) => {
        if (changed) {
          this.reloadMedia();
        }
      });
  }

  /** Ручное кадрирование уже сохранённой картинки */
  public cropImage(file: TuiFileLike): void {
    this.imageProcessingService.cropImage(file.name)
      .subscribe((res: StoredImageResultDto | null) => {
        if (res?.status === 'processed') {
          this.reloadMedia();
        }
      });
  }

  public isSavedImage(file: TuiFileLike): boolean {
    return !!this.productId && (this.initialMedia || []).includes(file.name);
  }

  /**
   * Перечитываем только картинки — остальные поля формы могли быть отредактированы
   * и терять их нельзя.
   */
  private reloadMedia(): void {
    if (!this.productId) {
      return;
    }
    this.productsService.getProductById(this.productId).subscribe((product: ProductModel | null) => {
      if (!product) {
        return;
      }
      const media = product.media || [];
      this.initialMedia = media;
      // При конвертации jpg в webp имя файла меняется — синхронизируем seo-блок по позиции
      const seoImage = this.formGroup.get('seo')?.get('seoImage') as FormArray;
      media.forEach((name: string, index: number) => {
        seoImage?.at(index)?.patchValue({ imageName: name });
      });
      this.getImages(media).subscribe((mediaRes: (TuiFileLike | null)[]) => {
        this.f['media'].setValue(mediaRes.filter((mediaItem) => mediaItem) || []);
      });
    });
  }

  public getImages(names: string[]): Observable<(TuiFileLike | null)[]> {
    return names.length ? forkJoin(names.map(name => this.imagesService.getImage(name))) : of([]);
  }

  public setEditorMode(mode: EditorMode): void {
    this.editorMode = mode;
  }

  public refreshData(): void {
    this.formGroup.reset({
      isNew: false,
      isRec: false,
      isStock: true,
      discount: 0,
    });
    this.productData = undefined;
    forkJoin({
      product: this.productId ? this.productsService.getProductById(this.productId) : of(null),
      brands: this.brandsService.getBrands(),
      categories: this.categoriesService.getCategoriesTree(),
      productTypes: this.typesService.getTypes(),
    }).subscribe((res: DataResponse) => {
      this.productData = res.product;
      this.brandsData = res.brands;
      this.categoriesData = res.categories;
      if (res.categories) {
        this.linearCategoriesData = this.linearCategory([res.categories]);
      }
      this.productTypesPrevsData = res.productTypes;
      if (res.product) {
        const productData = res.product;
        this.initialMedia = res.product.media || [];
        productData.seo?.seoImage?.forEach(el => (this.formGroup.get('seo')?.get('seoImage') as FormArray)
          .push(this.formBuilder.group(el)))
        this.getImages(res.product.media || []).subscribe(mediaRes => {
          setTimeout(() => {
            this.formGroup.patchValue({
              name: productData.name,
              media: mediaRes.filter(mediaItem => mediaItem) || [],
              price: productData.price,
              priceUSD: productData.priceUSD,
              totalPrice: productData.totalPrice,
              discount: productData.discount || 0,
              brand: productData.brand?._id,
              description: productData.description,
              content: productData.content,
              categoryId: productData.categoryId,
              productTypeId: productData.productTypeId,
              isNew: productData.isNew,
              isRec: productData.isRec,
              isStock: productData.isStock,
            });
            this.formGroup.get('seo')?.patchValue({
              seoTitle: productData.seo?.seoTitle || '',
              seoDescription: productData.seo?.seoDescription || '',
              seoKeywords: productData.seo?.seoKeywords || [],
              seoUrl: productData.seo?.seoUrl || '',
            })
          },1000);
        });
      } else {
        this.currentTypeData = null;
      }
    });
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  public get fProp(): { [key: string]: AbstractControl; } { return (this.f['productProps'] as FormGroup).controls; }

  @tuiPure
  public stringifyBrands(
    items: BrandModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({_id, name}) => [_id, name] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  @tuiPure
  public stringifyTypes(
    items: ProductTypePrevModel[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({_id, name}) => [_id, name] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  readonly categoryContent: TuiStringHandler<TuiValueContentContext<readonly unknown[]>> = ({$implicit}) => {
    const categoryItem = (this.linearCategoriesData).find((category => category._id === $implicit.toString()));
    if (categoryItem) {
      return categoryItem.name;
    }
    return 'Неизвестно';
  };

  readonly categoryChildHandler: TuiHandler<CategoryModel, readonly CategoryModel[]> = item => item.children?.sort((a,b) => (a.order || 0) - (b.order || 0)) || EMPTY_ARRAY;

  private linearCategory(treeData: CategoryModel[]): CategoryLinearModel[] {
    const recursionFn = (linearTree: CategoryLinearModel[],categoryNode: CategoryModel): void => {
      linearTree.push({
        _id: categoryNode._id,
        name: categoryNode.name,
        handle: categoryNode.handle,
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

  public onReject(files: TuiFileLike | readonly TuiFileLike[]): void {
    this.alertService.open([...(files as TuiFileLike[])].map(item => item.name).join(', '), {label: `Ошибка загрузки файлов`, status: TuiNotification.Error, autoClose: 5000}).subscribe();
  }

  public removeFile({name}: File, i: number): void {
    this.f['media'].setValue(
      this.f['media'].value?.filter((current: File) => current.name !== name) ?? [],
    );
    (this.formGroup.get('seo')?.get('seoImage') as FormArray).removeAt(i)
  }

  public changeSlug(value: string): void {
    this.formGroup.get('seo.seoUrl')?.setValue(value);
  }

  private setPropertiesControls(productTypeId: string): void {
    this.currentTypeData = undefined;
    this.clearPropertiesControls();
    this.typesService.getTypeById(productTypeId).subscribe((res: ProductTypeModel | null) => {
      if (res) {
        res.properties.forEach((property: ProductTypePropertyModel) => {
          (this.f['productProps'] as FormGroup).addControl(property._id, productPropertyControl(property.type));
          const productPropValue: ProductPropertyValueModel | undefined = this.productData?.productProps.find((prop: ProductPropertyValueModel) => prop.productTypePropertyId === property._id);
          if (productPropValue) {
            this.fProp[property._id].setValue(productPropValue.value);
          }
        });
        this.currentTypeData = res;
      } else {
        this.alertService.open(`Невозможно загрузить свойства для сущности c id: ${productTypeId}`, {label: `Ошибка загрузки`, status: TuiNotification.Error, autoClose: 3000}).subscribe();
      }
    });
  }

  private clearPropertiesControls(): void {
    Object.keys((this.f['productProps'] as FormGroup).controls).forEach((controlKey: string) => {
      (this.f['productProps'] as FormGroup).removeControl(controlKey);
    });
  }

  public drop(event: CdkDragDrop<string[]>) {
    const array = this.f['media'].value;
    const seoImageControls = (this.formGroup.get('seo')?.get('seoImage') as FormArray).controls
    const seoImageValues = (this.formGroup.get('seo')?.get('seoImage') as FormArray).value
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    moveItemInArray(seoImageControls, event.previousIndex, event.currentIndex);
    moveItemInArray(seoImageValues, event.previousIndex, event.currentIndex);
    this.f['media'].setValue(array);
  }

  public submit(): void {
    this.formGroup.markAsTouched();
    if (this.formGroup.valid) {
      const data = this.formGroup.value;
      this.loading = true;
      this.processMedia(this.initialMedia || [], data.media, data.seo.seoImage).subscribe(resMediaPayload => {
        const mediaRes: string[] = []
        const seoImageRes: any[] = []
        resMediaPayload.forEach(el => {
          mediaRes.push(el.media)
          seoImageRes.push(el.seoName)
        })
        const payload = {
          ...data,
          associatedProducts: (this.productData?.associatedProducts || []).map(item => item._id),
          media: mediaRes,
          seo: {
            ...data.seo,
            seoImage: seoImageRes
          },
          productProps: Object.entries<PropertyValue>(data.productProps || [])
            .map(([productTypePropertyId, value]: [string, PropertyValue]) =>
              ({ productTypePropertyId, value }))
        };
        if (this.productId) {
          this.productsService.updateProduct(this.productId.toString(), payload as UpdateProductDto).subscribe(
            res => {
              if (res) {
                this.alertService.open(`Продукт ${res.name} обновлён`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/products/list']);
              }
            },
            err => {
              this.loading = false;
            }
          );
        } else {
          this.productsService.addProduct(payload as AddProductDto).subscribe(
            res => {
              if (res) {
                this.alertService.open(`Продукт ${res.name} добавлен`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/products/list']);
              }
            },
            err => {
              this.loading = false;
            }
          );
        }
      })
    }
  }

  public showDeleteDialog(): void {
    if (this.productData) {
      this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить товар: ${this.productData.name}?`).subscribe({
        next: (res) => {
          if (res && this.productData) {
            this.productsService.deleteProduct(this.productData._id).subscribe((res) => {
              if (this.productData && res) {
                this.alertService.open(`Товар ${this.productData.name} удален`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
                this.router.navigate(['/products'])
              }
            });
          }
        },
      })
    }
  }

  private processMedia(initialNames: string[], resultMedias: TuiFileLike[], seoImage: any[]): Observable<any[]> {
    const resultMediaData: ResultMediaData[] = (resultMedias || []).map(media => {
      const isNew: boolean = !initialNames.includes(media.name);
      const shortName: string = randomBytes(7).toString('hex');
      return {
        file: media,
        name: isNew ? `${shortName}.${media.name.split('.')[1]}` : media.name,
        newShortName: isNew ? shortName : undefined,
      }
    });
    const resultNames: string[] = resultMediaData.map(media => media.file.name);
    const deleteRequests: Observable<any>[] = initialNames.filter(item => !resultNames.includes(item)).map(item => this.imagesService.deleteImage(item));
    const addMedias: ResultMediaData[] = resultMediaData.filter(media => media.newShortName);
    const addRequest: Observable<AddImagesResponseDto[]> = this.imagesService.addImages(addMedias, this.processOnUpload);
    return forkJoin(deleteRequests.length ? deleteRequests : [of(null)])
      .pipe(
        switchMap(() => addRequest
          .pipe(
            map((addResponse: AddImagesResponseDto[]) => {
              return resultMediaData
                .map(mediaData => {
                  if (mediaData.newShortName) {
                    const foundAddResponseItem = addResponse.find(responseItem => responseItem.shortName === mediaData.newShortName);
                    if (foundAddResponseItem) {
                      return {
                        ...mediaData,
                        name: foundAddResponseItem.name,
                      }
                    }
                    return undefined;
                  }
                  return mediaData;
                })
                .filter(mediaData => mediaData)
                .map(mediaData => {
                  const seoName = seoImage.filter(image => image.imageName === mediaData?.file.name)
                  seoName[0].imageName = mediaData?.name
                  return {
                    media: mediaData!.name,
                    seoName: seoName[0]
                  }
                });
            })
          )
        )
      );
  }

  generateUrl(text: string) {
    this.formGroup.get('seo')?.patchValue({
      seoUrl: transliteration(text)
    })
  }

  inputFileChange(file: File[]) {
    if (!file.length || file.length <= (this.f['seo'].get('seoImage') as FormArray).length) return
    if (file.length > (this.f['seo'].get('seoImage') as FormArray).length + 1) {
      let length = file.length - (this.f['seo'].get('seoImage') as FormArray).length
      while (length) {
        (this.f['seo'].get('seoImage') as FormArray).push(
          this.formBuilder.group({
            imageName: [file[(this.f['seo'].get('seoImage') as FormArray).length].name || ''],
            imageAlt: [this.formGroup.get('seo')?.get('seoImage')?.get('imageAlt')?.value || '']
          })
        )
        length--;
      }
      return
    }
    this.f['media'].markAsTouched();
    (this.f['seo'].get('seoImage') as FormArray).push(
      this.formBuilder.group({
        imageName: [file[file.length-1].name || ''],
        imageAlt: [this.formGroup.get('seo')?.get('seoImage')?.get('imageAlt')?.value || '']
      })
    )
  }

  onAltChange(event: Event, control: number) {
    (this.formGroup.get('seo')?.get('seoImage') as FormArray).at(control).patchValue({
      imageAlt: (event.target as HTMLInputElement).value
    })
  }

  protected readonly editorTools = EDITOR_TOOLS;
  protected readonly env = environment;
}
