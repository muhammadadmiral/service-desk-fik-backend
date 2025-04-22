import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import detectPort from 'detect-port';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const availablePort = await detectPort(3000);
  
  app.listen(availablePort, () => {
    console.log(`Server started on port ${availablePort}`);
  });
}
bootstrap();
