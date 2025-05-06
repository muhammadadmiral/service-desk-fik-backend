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

  // Enable CORS for all origins & credentials
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Use PORT from env (fallback ke 3001)
  const port = parseInt(process.env.PORT, 10) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on all interfaces at port ${port}`);
}

bootstrap();
