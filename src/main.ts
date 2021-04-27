import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
    const app: NestExpressApplication = await NestFactory.create<
    NestExpressApplication
  >(AppModule);

  const isProduction: boolean = false
  app.enableCors();

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  await app.listen(3000);
}   
bootstrap();
