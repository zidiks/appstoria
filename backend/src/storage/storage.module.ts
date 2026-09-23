import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { path } from 'app-root-path';
import { ImageProcessingService } from './image-processing.service';
import { ImageJobsService } from './image-jobs.service';
import { ProductSchema } from '../product/schema/product.schema';
import { ImageJobEntity, ImageJobSchema } from './schema/image-job.schema';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${path}/storage`,
      serveRoot: '/storage',
    }),
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
      { name: ImageJobEntity.name, schema: ImageJobSchema },
    ]),
  ],
  controllers: [StorageController],
  providers: [StorageService, ImageProcessingService, ImageJobsService],
  exports: [StorageService],
})
export class StorageModule {}
