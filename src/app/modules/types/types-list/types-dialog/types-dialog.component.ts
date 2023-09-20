import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import {
  ProductTypeModel,
  ProductTypePrevModel, ProductTypePropertyModel,
} from "../../../../shared/models/type-property.model";
import { ApiDataModel } from "../../../../shared/models/api-data.model";
import { TypesService } from "../../types.service";
import { PropertiesService } from "../../../properties/properties.service";
import { BehaviorSubject, forkJoin, map, Observable, shareReplay, startWith, Subject, switchMap } from "rxjs";
import { TUI_DEFAULT_MATCHER, TuiContextWithImplicit, TuiHandler, tuiIsString } from "@taiga-ui/cdk";
import { ProductPropertyPipe } from "../../../../shared/pipes/product-property/product-property.pipe";

@Component({
  selector: 'app-types-dialog',
  templateUrl: './types-dialog.component.html',
  styleUrls: ['./types-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypesDialogComponent {
  public typesData: ApiDataModel<ProductTypeModel>;
  private productPropertyPipe = new ProductPropertyPipe();
  public loading = false;
  private propertiesDataSubject: BehaviorSubject<ProductTypePropertyModel[]> = new BehaviorSubject<ProductTypePropertyModel[]>([]);
  public propertiesData$: Observable<ProductTypePropertyModel[]> = this.propertiesDataSubject.asObservable();

  public formGroup: FormGroup = this.formBuilder.group( {
    name : [ null, Validators.required ],
    description : [ null ],
    properties: [ [] ],
  } );

  private readonly properties$ = this.propertiesData$.pipe(
    shareReplay({bufferSize: 1, refCount: true}),
  );

  private readonly search$ = new Subject<string>();

  readonly items$ = this.search$.pipe(
    startWith(``),
    switchMap(search =>
      this.properties$.pipe(
        map(items =>
          items
            .filter(({name}) => TUI_DEFAULT_MATCHER(name, search))
            .map(({_id}) => _id),
        ),
      ),
    ),
    startWith(null),
  );

  readonly stringify$: Observable<
    TuiHandler<string | TuiContextWithImplicit<string>, string>
    > = this.properties$.pipe(
    map(items => new Map(items.map<[string, string]>(({_id, name, type}) => [_id, `${name} (${this.productPropertyPipe.transform(type)?.name})`]))),
    startWith(new Map()),
    map(
      map => (_id: string | TuiContextWithImplicit<string>) => {
        return (tuiIsString(_id) ? map.get(_id) : map.get(_id?.$implicit)) || `Loading...`;
      }
    ),
  );


  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<any, ProductTypePrevModel | undefined>,
    private formBuilder: FormBuilder,
    private typesService: TypesService,
    private propertiesService: PropertiesService,
  ) {
    if (this.typeData?._id) {
      forkJoin({
        properties: propertiesService.getProperties(),
        type: typesService.getTypeById(this.typeData._id),
      }).subscribe((res) => {
        this.propertiesDataSubject.next(res.properties || []);
        this.typesData = res.type || null;
        setTimeout(() => {
          this.formGroup.setValue({
            name: res.type?.name || '',
            description: res.type?.description || '',
            properties: res.type?.properties ? res.type.properties.map(item => item._id) : [],
          });
        });
      });
    } else {
      propertiesService.getProperties().subscribe(res =>  this.propertiesDataSubject.next(res || []));
      this.typesData = null;
    }
  }

  get typeData(): Partial<ProductTypeModel> | undefined {
    return this.context.data;
  }

  public onSearch(search: string | null): void {
    this.search$.next(search || ``);
  }

  public submit(): void {
    if (this.formGroup.valid) {
      this.loading = true;
      if (this.typeData?._id) {
        this.typesService.updateType(this.typeData?._id, this.formGroup.value).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      } else {
        this.typesService.addType(this.formGroup.value).subscribe(
          res => this.context.completeWith(res),
          err => this.context.completeWith(null),
        );
      }
    }
  }

}
