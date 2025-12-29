import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend applications
  const allowedOrigins = [
    'http://localhost:3001', // web local
    'http://localhost:3002', // admin local
  ];

  // Add production origins from environment variables
  if (process.env.WEB_URL) {
    allowedOrigins.push(process.env.WEB_URL);
  }
  if (process.env.ADMIN_URL) {
    allowedOrigins.push(process.env.ADMIN_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Set global prefix for API routes
  app.setGlobalPrefix('api');
  // Serve static files from /uploads for uploaded images
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `API server running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
