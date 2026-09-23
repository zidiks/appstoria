import { Component, Input } from '@angular/core';
import { ProductTypePropertyModel } from "../../models/type-property.model";
import { AbstractControl, FormControl } from "@angular/forms";
import { ProductTypePropertyType } from "../../enums/product-property.enum";
import { TUI_DEFAULT_MATCHER, tuiPure } from "@taiga-ui/cdk";

@Component({
  selector: 'property-input',
  templateUrl: './property-input.component.html',
  styleUrls: ['./property-input.component.scss'],
})
export class PropertyInputComponent {
  @Input() public propertyData!: ProductTypePropertyModel;
  @Input() public control!: AbstractControl<any, any>;
  public propertyTypes = ProductTypePropertyType;
  public search: string | null = ``;

  public get formControl(): FormControl {
    return this.control as FormControl;
  }

  public get options(): string[] {
    return (this.propertyData.options || []).map((option: string | number) => option.toString());
  }

  @tuiPure
  filter(search: string | null): readonly string[] {
    return this.options.filter(item => TUI_DEFAULT_MATCHER(item, search || ``));
  }
}
