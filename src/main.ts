import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  // Set base view dir to views in root folder
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // Set view engine to hbs(handlebars)
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
