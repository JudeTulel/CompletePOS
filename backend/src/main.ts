import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
const { createDatabaseIfNotExists } = require('./create-db');

async function bootstrap() {
  await createDatabaseIfNotExists();
  const app = await NestFactory.create(AppModule);

  // Enable CORS 
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = 5000;
  const host = '0.0.0.0';

  await app.listen(port, host);
  console.log(`NestJS HTTPS server running at http://${host === '0.0.0.0' ? 'localhost or LAN IP' : host}:${port}`);
}
bootstrap();
