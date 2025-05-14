// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,   // <<< ini biar @Param() id: number auto-cast
      },
    }),
  );

  app.enableCors({ origin: true, credentials: true });

  const port = parseInt(process.env.PORT, 10) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`BACKEND NYA JALAN NIH MEMEK LU NGENTOT`);
}

bootstrap();
