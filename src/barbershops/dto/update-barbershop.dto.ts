// src/barbershops/dto/update-barbershop.dto.ts
import {
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBarbershopDto {
  @ApiPropertyOptional({
    example: 'Nueva Barbería',
    description: 'Nuevo nombre de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @ApiPropertyOptional({
    example: 'Nueva Ubicación',
    description: 'Nueva ubicación de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  location?: string;

  @ApiPropertyOptional({ example: 40.7128, description: 'Latitud' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006, description: 'Longitud' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
