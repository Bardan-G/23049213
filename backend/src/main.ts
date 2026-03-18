import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Production Tip: In a real app, you would limit this to your frontend URL
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js default port
    credentials: true,
  });

  await app.listen(3002);
}
bootstrap();