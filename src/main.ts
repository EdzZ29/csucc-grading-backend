import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe,BadRequestException} from '@nestjs/common';
import * as cookieParser from 'cookie-parser'
import { AllExceptionsFilter } from './filter/forbidden-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          err => Object.values(err.constraints)[0]
        );
        return new BadRequestException(messages[0]); 
      },
    }),
  );
  app.use(cookieParser())
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin:['http://localhost:7000'],
    credentials: true
  })

  await app.listen(9000);

}
bootstrap();
