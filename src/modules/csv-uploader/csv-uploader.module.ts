import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvUploaderService } from './csv-uploader.service';
import { CsvUploaderController } from './csv-uploader.controller';
import { CsvUser, CsvUserSchema } from './entity/csv-user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CsvUser.name, schema: CsvUserSchema },
    ]),
  ],
  controllers: [CsvUploaderController],
  providers: [CsvUploaderService],
})
export class CsvUploaderModule {}
