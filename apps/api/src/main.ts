import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');
  const webOrigin = configService.getOrThrow<string>('WEB_ORIGIN');

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: webOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port);

  const applicationUrl = await app.getUrl();

  console.log(`StudyBlocks API running at ${applicationUrl}/api/v1`);
}

void bootstrap();
