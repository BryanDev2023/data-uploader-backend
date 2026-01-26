import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import config from './core/config/environment';

import { ValidationExceptionFilter } from './core/filters/validation-exception.filter';
import { JwtExceptionFilter } from './core/filters/jwt-exception.filter';

async function bootstrap() {
  const logger = new Logger("Main");
  
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
    bodyParser: true,
  });

  useContainer(
    app.select(AppModule),
    { fallbackOnErrors: true }
  );

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new JwtExceptionFilter()
  );

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  const configDocument = new DocumentBuilder()
    .setTitle("Data Uploader API")
    .setDescription("API for data uploader")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(config.port, () => {
    logger.log(`Server is running on port ${config.port}`);
  });
}

bootstrap();
