import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parse } from 'csv-parse/sync';
import { CsvUser, CsvUserDocument } from './entity/csv-user.entity';

@Injectable()
export class CsvUploaderService {
  constructor(
    @InjectModel(CsvUser.name)
    private readonly csvUserModel: Model<CsvUserDocument>,
  ) {}

  async processCsv(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo CSV no proporcionado');
    }

    const rawContent = file.buffer.toString('utf-8');
    const records = parse(rawContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    const success: Array<{ id: string; name: string; email: string; age: number }> = [];
    const errors: Array<{ row: number; details: Record<string, string> }> = [];

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
      if (!ageRaw) {
        details.age = "El campo 'age' es requerido.";
      } else if (!Number.isInteger(age) || age <= 0) {
        details.age = "El campo 'age' debe ser un número positivo.";
      }

      if (Object.keys(details).length > 0) {
        errors.push({ row: rowNumber, details });
        continue;
      }

      try {
        const created = await this.csvUserModel.create({
          name,
          email,
          age,
        });

        success.push({
          id: created._id.toString(),
          name: created.name,
          email: created.email,
          age: created.age,
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

    return { success, errors };
  }
}
