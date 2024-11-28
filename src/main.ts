import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // take only those which is only entioned in dto
    }),
  );
  await app.listen(process.env.PORT ?? 9001);
}
bootstrap();
