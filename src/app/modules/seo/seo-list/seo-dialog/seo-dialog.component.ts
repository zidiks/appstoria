import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiAlertService, TuiDialogContext } from "@taiga-ui/core";

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
import { SeoModel } from "../../../../shared/models/seo.model";
import { SeoService } from "../../seo.service";

@Component({
  selector: 'app-seo-dialog',
  templateUrl: './seo-dialog.component.html',
  styleUrls: ['./seo-dialog.component.scss'],
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
export class SeoDialogComponent implements OnInit {
  public loading = false;
  public editorTools = EDITOR_TOOLS;

  get seoData(): Partial<SeoModel> | undefined {
    return this.context.data;
  }

  public formGroup: FormGroup = this.formBuilder.group( {
    title: [ this.seoData?.title, Validators.required ],
    description : [ this.seoData?.description, Validators.required ],
    keywords : [ this.seoData?.keywords, Validators.required ],
    tag : [ this.seoData?.tag, Validators.required ],
    content : [ this.seoData?.content, Validators.required ],
    url : [ this.seoData?.url, Validators.required ],
  } );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, SeoModel | undefined>,
    private formBuilder: FormBuilder,
    private brandsService: SeoService,
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
  ) { }

  public ngOnInit(): void {}

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      const formValue = this.formGroup.value;
      if (this.seoData?._id) {
        formValue.id = this.seoData?._id;
      }
      this.brandsService.setSeo(formValue as Partial<SeoModel>).subscribe(
        res => {this.context.completeWith(res)},
        err => this.context.completeWith(null),
      );
    } else {
      this.formGroup.markAsTouched();
    }
  }
}
