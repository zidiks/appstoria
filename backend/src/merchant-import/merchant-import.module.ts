import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantImportController } from './merchant-import.controller';
import { MerchantImportService } from './merchant-import.service';
import {
  MerchantImportSource,
  MerchantImportSourceSchema,
} from './schema/merchant-import-source.schema';
import { ProductSchema } from '../product/schema/product.schema';
import { CategorySchema } from '../category/schema/category.schema';
import { BrandSchema } from '../product/brand/schema/brand.schema';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MerchantImportSource.name, schema: MerchantImportSourceSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Brand', schema: BrandSchema },
    ]),
    StorageModule,
  ],
  controllers: [MerchantImportController],
  providers: [MerchantImportService],
})
export class MerchantImportModule {}
