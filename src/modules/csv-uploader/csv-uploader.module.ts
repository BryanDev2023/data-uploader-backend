import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvUploaderService } from './csv-uploader.service';
import { CsvUploaderController } from './csv-uploader.controller';
import { CsvUser, CsvUserSchema } from './entity/csv-user.entity';
import { CsvUploadError, CsvUploadErrorSchema } from './entity/csv-upload-error.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CsvUser.name, schema: CsvUserSchema },
      { name: CsvUploadError.name, schema: CsvUploadErrorSchema },
    ]),
  ],
  controllers: [CsvUploaderController],
  providers: [CsvUploaderService],
})
export class CsvUploaderModule {}
