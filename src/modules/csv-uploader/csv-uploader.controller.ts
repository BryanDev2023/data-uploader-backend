import { Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors, Res, Delete, Param } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvUploaderService } from './csv-uploader.service';
import { ApiResponse } from '../../core/responses/api-response';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller("csv-uploader")
export class CsvUploaderController {
  constructor(private readonly csvUploaderService: CsvUploaderService) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.processCsv(file);
      const hasSuccess = result.success.length > 0;
      const hasErrors = result.errors.length > 0;
      const statusCode = hasErrors && !hasSuccess ? 400 : hasErrors ? 207 : 201;
      res.status(statusCode);
      return ApiResponse.success('Archivo procesado', result, statusCode);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Get()
  async getUploadedFiles(): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.getUploadedFiles();
      return ApiResponse.success('Archivos subidos', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Get('get-file/:id')
  async getUploadedFileById(@Param('id') id: string): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.getUploadedFileById(id);
      return ApiResponse.success('Archivo obtenido', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Get('failed-uploads')
  async getFailedUploads(): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.getFailedUploads();
      return ApiResponse.success('Archivos con errores', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }

  @Delete('delete-all-files')
  async deleteUploadedFiles(): Promise<ApiResponse> {
    try {
      const result = await this.csvUploaderService.deleteUploadedFiles();
      return ApiResponse.success('Archivos eliminados', result);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}
