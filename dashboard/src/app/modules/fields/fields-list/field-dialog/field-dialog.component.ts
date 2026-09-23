import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogContext, TuiNotification } from "@taiga-ui/core";
import { FieldsService } from "../../fields.service";
import { FieldModel } from "../../../../shared/models/field.model";
import { fieldTypeData } from "../../../../shared/constants/field-type.const";
import { FieldTypeDataModel } from "../../../../shared/models/field-type-data.model";
import { TuiContextWithImplicit, tuiPure, TuiStringHandler } from "@taiga-ui/cdk";
import { FieldType } from "../../../../shared/enums/field-type.enum";
import {
  defaultEditorExtensions,
  TUI_EDITOR_CONTENT_PROCESSOR,
  TUI_EDITOR_EXTENSIONS,
  TUI_IMAGE_LOADER,
  tuiLegacyEditorConverter
} from "@taiga-ui/addon-editor";
import { imageLoader } from "./image-loader";
import { ImagesService } from "../../../../shared/services/images.service";
import { EDITOR_TOOLS } from "./editor-tools.const";
import { TuiFileLike } from "@taiga-ui/kit";
import { map, Observable, of, switchMap } from "rxjs";
import { ResultMediaData } from "../../../../shared/models/images.model";
import * as randomBytes from "randombytes";

interface FieldTypeItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-field-dialog',
  templateUrl: './field-dialog.component.html',
  styleUrls: ['./field-dialog.component.scss'],
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
export class FieldDialogComponent implements OnInit {
  public loading = false;
  public fieldTypes: FieldTypeItem[] = Object.entries(fieldTypeData).map(([key, value]: [string, FieldTypeDataModel]) => {
    return {
      label: value.name,
      value: key,
    }
  });
  public fieldTypeEnum = FieldType;
  public editorTools = EDITOR_TOOLS;
  public formGroup: FormGroup = this.formBuilder.group( {
    label: [ this.fieldData?.label, Validators.required ],
    code : [ this.fieldData?.code, Validators.required ],
    type : [ this.fieldData?.type, Validators.required ],
    value : [ this.fieldData?.type === FieldType.FieldImage ? null : this.fieldData?.value, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, FieldModel | undefined>,
    private formBuilder: FormBuilder,
    private brandsService: FieldsService,
    private imagesService: ImagesService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  public ngOnInit(): void {
    if (this.fieldData?.type === FieldType.FieldImage) {
      const imageVal = this.fieldData?.value?.toString();
      if (imageVal) {
        this.imagesService.getImage(imageVal).subscribe((mediaRes: TuiFileLike | null) => {
          if (mediaRes) {
            this.f['value'].setValue(mediaRes);
          } else {
            this.alertService.open('Невозможно загрузить изображения', {label: `Ошибка загрузки`, status: TuiNotification.Warning, autoClose: 3000}).subscribe();
          }
        });
      }
    }
    this.f['type'].valueChanges.subscribe(() => {
      this.f['value'].reset();
    });
  }

  get fieldData(): Partial<FieldModel> | undefined {
    return this.context.data;
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const formValue = this.formGroup.value;
      if (formValue.type === this.fieldTypeEnum.FieldImage) {
        if (this.f['value'].value) {
          this.processMedia(this.fieldData?.value?.toString(), this.f['value'].value, !this.fieldData?._id).subscribe((resMediaPayload: string) => {
            formValue.value = resMediaPayload;
            this.brandsService.setField(formValue as Partial<FieldModel>).subscribe(
              res => this.context.completeWith(res),
              err => this.context.completeWith(null),
            );
          });
        } else {
          this.alertService.open('Добавьте изображение', {label: `Ошибка сохранения`, status: TuiNotification.Warning, autoClose: 3000}).subscribe();
        }
      } else {
        this.brandsService.setField(formValue as Partial<FieldModel>).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    } else {
      this.formGroup.markAsTouched();
    }
  }

  public get f(): { [key: string]: AbstractControl; } { return this.formGroup.controls; }

  @tuiPure
  public stringify(
    items: FieldTypeItem[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({value, label}) => [value, label] as [string, string]));

    return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || ``;
  }

  public onReject(files: TuiFileLike | readonly TuiFileLike[]): void {
    this.alertService.open([...(files as TuiFileLike[])].map(item => item.name)[0], {label: `Ошибка загрузки изображения`, status: TuiNotification.Error, autoClose: 5000}).subscribe();
  }

  public removeFile({name}: File): void {
    this.f['value'].setValue(null);
  }

  private processMedia(initialName: string | undefined | null, resultMedia: TuiFileLike, newField?: boolean): Observable<string> {
    if (newField || !initialName) {
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
