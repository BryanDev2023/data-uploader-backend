import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { parse } from 'csv-parse/sync';
import { CsvUser, CsvUserDocument } from './entity/csv-user.entity';
import { CsvUploadError, CsvUploadErrorDocument } from './entity/csv-upload-error.entity';
import { Csv, CsvError, CsvResponse } from 'src/types/csv';

@Injectable()
export class CsvUploaderService {
  private readonly logger = new Logger(CsvUploaderService.name);

  constructor(
    @InjectModel(CsvUser.name)
    private readonly csvUserModel: Model<CsvUserDocument>,
    @InjectModel(CsvUploadError.name)
    private readonly csvUploadErrorModel: Model<CsvUploadErrorDocument>,
  ) { }

  async processCsv(file?: Express.Multer.File): Promise<CsvResponse> {
    if (!file) {
      throw new BadRequestException('Archivo CSV no proporcionado');
    }

    this.logger.log(`Procesando archivo CSV: ${file.originalname}`);

    let records: Array<Record<string, string>>;
    try {
      const rawContent = file.buffer.toString('utf-8');
      records = parse(rawContent, {
        columns: (headers: string[]) =>
          headers.map((header, index) => {
            const normalized = header.replace(/^\uFEFF/, '').trim().toLowerCase();
            return normalized || `__ignored_${index}`;
          }),
        skip_empty_lines: true,
        trim: true,
        bom: true,
        delimiter: [',', ';', '\t'],
        relax_column_count: true,
      }) as Array<Record<string, string>>;
    } catch (parseError: any) {
      await this.csvUploadErrorModel.create({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'failed',
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        errors: [],
        parseError: parseError?.message || 'Error al procesar el CSV.',
      });
      throw new BadRequestException('Archivo CSV inválido');
    }

    const success: Array<Csv> = [];
    const errors: Array<CsvError> = [];

    for (let index = 0; index < records.length; index += 1) {
      const rowNumber = index + 2;
      const record = records[index] ?? {};
      const details: Record<string, string> = {};

      const name = (record.name || '').trim();
      const email = (record.email || '').trim();
      const ageRaw = record.age;

      if (!name) {
        details.name = "El campo 'name' no puede estar vacío.";
      }

      if (!email) {
        details.email = "El campo 'email' no puede estar vacío.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        details.email = "El formato del campo 'email' es inválido.";
      }

      const age = Number(ageRaw);
      if (ageRaw === undefined || ageRaw === null || ageRaw === '') {
        details.age = "El campo 'age' es requerido.";
      } else if (!Number.isInteger(age) || age <= 0) {
        details.age = "El campo 'age' debe ser un número positivo.";
      }

      if (Object.keys(details).length > 0) {
        errors.push({ row: rowNumber, details });
        continue;
      }

      try {
        const createdCsv = await this.csvUserModel.create({
          name,
          email,
          age,
        });

        success.push({
          id: createdCsv._id.toString(),
          name: createdCsv.name,
          email: createdCsv.email,
          age: createdCsv.age,
        });
      } catch (dbError: any) {
        errors.push({
          row: rowNumber,
          details: {
            email: dbError?.message || 'Error al insertar el registro.',
          },
        });
      }

    }
    if (errors.length > 0) {
      await this.csvUploadErrorModel.create({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: success.length > 0 ? 'partial' : 'failed',
        totalRows: records.length,
        successCount: success.length,
        errorCount: errors.length,
        errors: errors.map((error) => ({
          row: error.row,
          details: error.details,
        })),
      });
    }

    this.logger.log(`Archivo CSV procesado exitosamente: ${file.originalname}`);
    this.logger.log(`Registros exitosos: ${success.length}`);
    this.logger.log(`Registros con errores: ${errors.length}`);
    return { success: success, errors };
  }

  async getUploadedFiles(): Promise<CsvUserDocument[]> {
    const files = await this.csvUserModel.find().sort({ createdAt: -1 });
    if (!files || files.length === 0) {
      throw new NotFoundException('No se encontraron archivos subidos');
    }
    this.logger.log(`Archivos subidos: ${files.length}`);
    return files;
  }

  async deleteUploadedFiles(): Promise<DeleteResult> {
    const deletedFiles = await this.csvUserModel.deleteMany({});
    if (!deletedFiles || deletedFiles.deletedCount === 0) {
      throw new NotFoundException('No se encontraron archivos subidos');
    }
    this.logger.log(`Archivos eliminados: ${deletedFiles.deletedCount}`);
    return deletedFiles;
  }

  async getUploadedFileById(id: string): Promise<CsvUserDocument> {
    const file = await this.csvUserModel.findById(id);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }
    this.logger.log(`Archivo encontrado: ${file.name}`);
    return file;
  }
  
  async deleteUploadedFileById(id: string): Promise<DeleteResult> {
    const deletedFile = await this.csvUserModel.findByIdAndDelete(id);
    if (!deletedFile) {
      throw new NotFoundException('Archivo no encontrado');
    }
    this.logger.log(`Archivo eliminado: ${deletedFile.name}`);
    return { acknowledged: true, deletedCount: 1 };
  }

  async getFailedUploads(): Promise<CsvUploadErrorDocument[]> {
    const failedUploads = await this.csvUploadErrorModel.find().sort({ created_at: -1 });
    if (!failedUploads || failedUploads.length === 0) {
      throw new NotFoundException('No se encontraron archivos con errores');
    }
    this.logger.log(`Archivos con errores: ${failedUploads.length}`);
    return failedUploads;
  }

}
