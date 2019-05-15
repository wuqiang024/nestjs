import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('v1'); 给路由设置前缀 比如之前/users可以访问，现在需要/v1/users
  await app.listen(3000);
}
bootstrap();
