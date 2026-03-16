// ── Load .env FIRST before anything else reads process.env ──────────────────
import * as dotenv from 'dotenv';
dotenv.config();
// ─────────────────────────────────────────────────────────────────────────────

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filter/forbidden-exception.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => Object.values(err.constraints)[0]);
        return new BadRequestException(messages[0]);
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());

  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:7000']
    : ['http://localhost:7000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT || 9000;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
  console.log(`DB_HOST: ${process.env.DB_HOST}`);  // temp: confirm env is loaded
}
bootstrap();