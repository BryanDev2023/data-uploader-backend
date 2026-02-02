import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CsvUploaderModule } from './modules/csv-uploader/csv-uploader.module';
import config from './core/config/environment';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongodb, { dbName: config.dbName }),
    AuthModule,
    CsvUploaderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
