import {
  IsString,
  IsNumber,
  Min,
  IsPositive,
  IsOptional,
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
  @MinLength(3, {
    message: 'El nombre del servicio debe tener al menos 3 caracteres',
  })
  serviceName: string;

  @ApiProperty({
    example: 'Corte de cabello profesional con tijeras',
    description: 'Descripción del servicio',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 25.99,
    description: 'Precio del servicio (en dólares)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5, { message: 'El precio debe ser al menos $5' })
  price: number;

  @ApiProperty({
    example: 30,
    description: 'Duración del servicio en minutos',
  })
  @IsPositive()
  @Min(10, { message: 'La duración debe ser al menos de 10 minutos' })
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
}
