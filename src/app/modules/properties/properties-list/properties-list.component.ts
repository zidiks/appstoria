import { Component, Inject, OnInit } from '@angular/core';
import { PropertiesService } from "../properties.service";
import { ApiDataModel } from "../../../shared/models/api-data.model";
import { ProductTypePropertyModel } from "../../../shared/models/type-property.model";
import { SubmitService } from "../../../shared/services/submit.service";
import { TuiAlertService, TuiNotification } from "@taiga-ui/core";

@Component({
  selector: 'app-properties-list',
  templateUrl: './properties-list.component.html',
  styleUrls: ['./properties-list.component.scss']
})
export class PropertiesListComponent implements OnInit {
  public page = 0;
  public size = 10;
  public propertiesData: ApiDataModel<ProductTypePropertyModel[]>;
  public breadcrumbs = [
    {
      caption: `Главная`,
      routerLink: `/`,
    },
    {
      caption: `Свойства`,
      routerLink: `/properties`,
    },
  ];

  readonly columns = ['name', 'type', 'showCard', 'showFilter'];

  constructor(
    @Inject(TuiAlertService) private readonly alertService: TuiAlertService,
    private propertiesService: PropertiesService,
    private submitService: SubmitService,
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  public refreshData(): void {
    this.propertiesData = undefined;
    this.propertiesService.getProperties().subscribe((res: ProductTypePropertyModel[] | null) => {
      this.propertiesData = res;
    });
  }

  showDeleteDialog(id: string, title: string): void {
    this.submitService.submitDialog('Удалить', `Вы действительно хотите удалить свойство: ${title}?`).subscribe({
      next: (res) => {
        if (res) {
          this.propertiesService.deleteProperty(id).subscribe(() => {
            this.alertService.open(`Свойство ${title} удалено`, {label: `Успешно`, status: TuiNotification.Success, autoClose: 5000}).subscribe();
            this.refreshData();
          });
        }
      },
    })
  }

}
