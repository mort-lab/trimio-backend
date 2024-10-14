import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // Asegúrate de importar esto

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Use ValidationPipe for validating DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes any extra properties not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are present
      transform: true, // Automatically transform payloads to match the DTO class
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Trimio API') // API title
    .setDescription('API for managing barbers and customers') // API description
    .setVersion('1.0') // API version
    .addBearerAuth() // Enable Bearer token authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Servir archivos estáticos desde la carpeta 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  await app.listen(3003);
}
bootstrap();
