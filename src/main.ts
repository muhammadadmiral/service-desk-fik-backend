import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,         // <-- reflect origin header
    credentials: true,    // <-- allow cookies/auth
  });

  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();