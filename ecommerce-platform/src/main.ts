import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import * as crypto from 'crypto';

// @ts-ignore
global.crypto = crypto;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API for e-commerce platform')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3000, '0.0.0.0');
}

bootstrap();
