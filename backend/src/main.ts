import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 1. Updated CORS for Production
  app.enableCors({
    origin: [
      'http://localhost:3000',        // For local testing
      'https://gkastha.com.np',       // Your custom domain stripped
      'https://www.gkastha.com.np',   // Your custom domain with www
      /\.vercel\.app$/                // Allows all Vercel preview links
    ],
    credentials: true,
  });

  // 2. Dynamic Port Binding for Render
  // Render passes a PORT env var; if missing, it defaults to 10000
  const port = process.env.PORT || 10000;

  // 3. Listen on '0.0.0.0' (CRITICAL for Render)
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port: ${port}`);
}
bootstrap();