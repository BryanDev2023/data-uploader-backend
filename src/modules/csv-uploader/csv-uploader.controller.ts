import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvUploaderService } from './csv-uploader.service';
import { ApiResponse } from '../../core/responses/api-response';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller()
export class CsvUploaderController {
  constructor(private readonly csvUploaderService: CsvUploaderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.processCsv(file);
      return ApiResponse.success('Archivo procesado', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
