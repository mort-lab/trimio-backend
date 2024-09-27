import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  SwaggerModule.setup('api', app, document); // Swagger available at /api

  await app.listen(3000);
}
bootstrap();
