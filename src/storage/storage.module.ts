import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { path } from 'app-root-path';
import { ImageProcessingService } from './image-processing.service';
import { ImageJobsService } from './image-jobs.service';
import { ProductSchema } from '../product/schema/product.schema';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${path}/storage`,
      serveRoot: '/storage',
    }),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [StorageController],
  providers: [StorageService, ImageProcessingService, ImageJobsService],
})
export class StorageModule {}
