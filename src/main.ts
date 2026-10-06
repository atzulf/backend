import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let cachedApp: any;

async function bootstrapServer() {
  if (cachedApp) return cachedApp;
  
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Catetan Duit API')
    .setDescription('The Catetan Duit API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  cachedApp = app;
  return app;
}

// For local development (when not running inside Vercel)
if (!process.env.VERCEL) {
  bootstrapServer().then(app => {
    app.listen(process.env.PORT ?? 3000, () => {
      console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
    });
  });
}

// For Vercel Serverless
export default async function handler(req: any, res: any) {
  await bootstrapServer();
  return server(req, res);
}
