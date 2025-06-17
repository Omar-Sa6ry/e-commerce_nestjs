import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import * as bodyParser from 'body-parser';
import { json } from 'express';
import { DataSource } from 'typeorm';
import { NestFactory, Reflector } from '@nestjs/core';
import { I18nValidationException } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { GeneralResponseInterceptor } from './common/interceptors/generalResponse.interceptor';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { SqlInjectionInterceptor } from './common/interceptors/sqlInjection.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 5 }));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
      new SqlInjectionInterceptor(),
      new GeneralResponseInterceptor(),
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => new I18nValidationException(errors),
      }),
    );

    app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
    app.use('/google/callback', bodyParser.raw({ type: 'application/json' }));
    app.use(json());

    const dataSource = app.get(DataSource);
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    await app.listen(process.env.PORT || 3000);
  } catch (error) {
    console.error(error);
    throw new BadRequestException(error);
  }
}

bootstrap();
