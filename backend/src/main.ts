// Polyfill: ensure global crypto is available (required for NestJS TypeORM in pkg/Node18)
import { webcrypto } from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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
  console.log(`NestJS HTTP server running at http://${host === '0.0.0.0' ? 'localhost or LAN IP' : host}:${port}`);
}
bootstrap();
