import { Pipe, PipeTransform } from '@angular/core';
import { ProductTypePropertyDataModel } from "../../models/product-type-property-data.model";
import { ProductTypePropertyType } from "../../enums/product-property.enum";
import { productsTypesPropertiesData } from "../../constants/product-type-property.const";

@Pipe({
  name: 'productProperty'
})
export class ProductPropertyPipe implements PipeTransform {

  transform(value: string): ProductTypePropertyDataModel | undefined {
    if (Object.values(ProductTypePropertyType).includes(value as ProductTypePropertyType)) {
      return productsTypesPropertiesData[value as ProductTypePropertyType];
    }
    return undefined;
  }

}
