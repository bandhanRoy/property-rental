import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { GlobalExceptionHandler } from './filters/global-exception.filter';
import helmet from 'helmet';
import { requestLogger } from './config/morgan';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.setGlobalPrefix('api/v1'); //edit your prefix as per your requirements!
  app.useGlobalPipes(new ValidationPipe());
  // handle global errors
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionHandler(httpAdapter));
  app.use(requestLogger);
  app.use(helmet());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3000);
}
bootstrap();
