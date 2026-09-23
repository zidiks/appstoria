import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { DeleteDTO } from './dto/delete.dto';
import { ImageJobsService } from './image-jobs.service';
import { CropImageDTO } from './dto/crop-image.dto';
import { ProcessFilesDTO, ProcessOptionsDTO } from './dto/process-images.dto';
import { IdValidationPipe } from '../helpers/pipes/idValidation.pipe';

@Controller('storage')
export class StorageController {
  constructor(
    private storageService: StorageService,
    private imageJobsService: ImageJobsService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('image'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('process') process?: string,
    @Query('force') force?: string,
  ) {
    const isImages = files.every((i) => i.mimetype.includes('image'));
    if (isImages)
      return this.storageService.convertAndSave(files, {
        process: this.isEnabled(process),
        force: this.isEnabled(force),
      });
    throw new HttpException('Only image allow', HttpStatus.FORBIDDEN);
  }

  /** Обработать все изображения одного товара */
  @Post('process/product/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async processProduct(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: ProcessOptionsDTO,
  ) {
    return this.imageJobsService.processProduct(id, { force: dto?.force });
  }

  /** Обработать конкретные файлы — например, повторить прогон по списку warnings */
  @Post('process/files')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async processFiles(@Body() dto: ProcessFilesDTO) {
    return this.imageJobsService.processFiles(dto.files, { force: dto.force });
  }

  /** Массовый прогон по всем товарам, идёт фоном */
  @Post('process/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async processAll(@Body() dto: ProcessOptionsDTO) {
    return this.imageJobsService.startAllProductsJob({ force: dto?.force });
  }

  @Get('process/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getJobs() {
    return this.imageJobsService.getJobs();
  }

  /**
   * Последняя задача — по ней админка переподключается к прогрессу после
   * перезахода. Объявлена до :jobId, иначе current уедет в параметр.
   */
  @Get('process/jobs/current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getCurrentJob() {
    return this.imageJobsService.getCurrentJob();
  }

  @Get('process/jobs/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getJob(@Param('jobId') jobId: string) {
    return this.imageJobsService.getJob(jobId);
  }

  /** Остановить зависший или ненужный прогон */
  @Post('process/jobs/:jobId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async cancelJob(@Param('jobId') jobId: string) {
    return this.imageJobsService.cancelJob(jobId);
  }

  /** Ручное кадрирование: квадрат и паддинг всё равно считает бэк */
  @Post('crop')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async cropImage(@Body() dto: CropImageDTO) {
    const { file, ...crop } = dto;
    return this.imageJobsService.cropFile(file, crop);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getStorage() {
    return this.storageService.getStorage();
  }

  @Delete(':folder/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async deleteFile(@Param() deleteDTO: DeleteDTO) {
    return this.storageService.deleteFile(deleteDTO);
  }

  private isEnabled(value?: string): boolean {
    return value === 'true' || value === '1';
  }
}
