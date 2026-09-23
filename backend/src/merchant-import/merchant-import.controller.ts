import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { IdValidationPipe } from '../helpers/pipes/idValidation.pipe';
import { MerchantImportService } from './merchant-import.service';
import {
  MerchantImportPreviewDTO,
  MerchantImportSourceDTO,
} from './dto/merchant-import-source.dto';

@Controller('store/merchant-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class MerchantImportController {
  constructor(private readonly merchantImportService: MerchantImportService) {}

  @Get('sources')
  getSources() {
    return this.merchantImportService.getSources();
  }

  @Get('sources/:id')
  getSource(@Param('id', IdValidationPipe) id: string) {
    return this.merchantImportService.getSourceView(id);
  }

  @Post('sources')
  createSource(@Body() dto: MerchantImportSourceDTO) {
    return this.merchantImportService.createSource(dto);
  }

  @Put('sources/:id')
  updateSource(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: MerchantImportSourceDTO,
  ) {
    return this.merchantImportService.updateSource(id, dto);
  }

  @Delete('sources/:id')
  deleteSource(@Param('id', IdValidationPipe) id: string) {
    return this.merchantImportService.deleteSource(id);
  }

  @Post('sources/:id/run')
  run(@Param('id', IdValidationPipe) id: string) {
    return this.merchantImportService.startRun(id);
  }

  @Post('preview')
  preview(@Body() dto: MerchantImportPreviewDTO) {
    return this.merchantImportService.preview(dto);
  }
}
