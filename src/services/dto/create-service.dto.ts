import {
  IsString,
  IsNumber,
  Min,
  IsPositive,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    example: 'Corte de cabello',
    description: 'Nombre del servicio',
  })
  @IsString()
  @MinLength(3, { message: 'Service name must be at least 3 characters long' })
  serviceName: string;

  @ApiProperty({
    example: 'Corte de cabello profesional con tijeras',
    description: 'Descripción del servicio',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 25.99,
    description: 'Precio del servicio',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5, { message: 'Price must be at least $5' })
  price: number;

  @ApiProperty({
    example: 30,
    description: 'Duración del servicio en minutos',
  })
  @IsPositive()
  @Min(10, { message: 'Duration must be at least 10 minutes' })
  duration: number;

  @ApiProperty({
    example: '1b3e7eae-f1b2-47b6-a624-5df847b2d5b3',
    description: 'ID de la barbería a la que pertenece el servicio',
  })
  @IsUUID()
  barbershopId: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el servicio está activo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 'Cortes',
    description: 'Categoría del servicio',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del servicio',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid image URL format' })
  imageUrl?: string;
}
