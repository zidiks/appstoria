import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TuiContextWithImplicit, tuiIsString } from "@taiga-ui/cdk";
import { MerchantImportService } from "../merchant-import.service";
import {
  MerchantImportPreviewDto,
  MerchantImportSourceDto,
  MerchantImportSourceResponseDto
} from "../../../../shared/dto/merchant-import.dto";
import { CategoriesService } from "../../../categories/categories.service";
import { CategoryModel } from "../../../../shared/models/category.model";

@Component({
  selector: 'app-merchant-import-dialog',
  templateUrl: './merchant-import-dialog.component.html',
  styleUrls: ['./merchant-import-dialog.component.scss']
})
export class MerchantImportDialogComponent {
  public loading = false;
  public previewLoading = false;
  public preview: MerchantImportPreviewDto | null = null;
  public previewError = '';
  public categoryIds: string[] = [];
  private categoryNames = new Map<string, string>();

  public formGroup: FormGroup = this.formBuilder.group({
    name: [this.source?.name, Validators.required],
    url: [this.source?.url, [Validators.required, Validators.pattern(/^https?:\/\/\S+$/i)]],
    enabled: [this.source?.enabled ?? true],
    intervalHours: [this.source?.intervalHours ?? 12, [Validators.required, Validators.min(1), Validators.max(720)]],
    markupPercent: [this.source?.markupPercent ?? 30, [Validators.required, Validators.min(0), Validators.max(500)]],
    defaultCategoryId: [this.source?.defaultCategoryId ?? null],
    matchCategoryByHandle: [this.source?.matchCategoryByHandle ?? true],
    createNew: [this.source?.createNew ?? true],
    updateContent: [this.source?.updateContent ?? false],
    hideMissing: [this.source?.hideMissing ?? true],
  });

  public readonly stringifyCategory = (id: string | TuiContextWithImplicit<string>): string => {
    const key = tuiIsString(id) ? id : id?.$implicit;
    return this.categoryNames.get(key) || '—';
  };

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<MerchantImportSourceResponseDto | null, MerchantImportSourceResponseDto | undefined>,
    private formBuilder: FormBuilder,
    private merchantImportService: MerchantImportService,
    categoriesService: CategoriesService,
  ) {
    categoriesService.getCategories().subscribe(res => {
      const categories: CategoryModel[] = res || [];
      this.categoryNames = new Map(categories.map(({ _id, name, handle }) => [_id, `${name} (${handle})`]));
      this.categoryIds = categories.map(({ _id }) => _id);
    });
  }

  get source(): MerchantImportSourceResponseDto | undefined {
    return this.context.data;
  }

  public checkFeed(): void {
    const { url, markupPercent } = this.formGroup.value;
    if (!url) return;
    this.previewLoading = true;
    this.previewError = '';
    this.preview = null;
    this.merchantImportService.preview(url, Number(markupPercent) || 0).subscribe({
      next: (res) => {
        this.preview = res;
        this.previewLoading = false;
      },
      error: (err) => {
        this.previewError = err?.error?.message || 'Не удалось прочитать фид';
        this.previewLoading = false;
      },
    });
  }

  public submit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.value;
    const payload: MerchantImportSourceDto = {
      ...value,
      intervalHours: Number(value.intervalHours),
      markupPercent: Number(value.markupPercent),
      defaultCategoryId: value.defaultCategoryId || undefined,
    };
    this.loading = true;
    const request = this.source?._id
      ? this.merchantImportService.updateSource(this.source._id, payload)
      : this.merchantImportService.addSource(payload);
    request.subscribe({
      next: (res) => this.context.completeWith(res),
      error: () => this.loading = false,
    });
  }
}
