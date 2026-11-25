import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') || true });
  await app.listen(Number(process.env.PORT || 3000));
}
bootstrap();
