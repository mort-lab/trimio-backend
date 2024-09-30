// src/barbershops/dto/create-barbershop.dto.ts

import { IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBarbershopDto {
  @ApiProperty({
    example: 'Central Barbershop',
    description: 'Nombre de la barbería',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    example: 'Calle Principal 123',
    description: 'Dirección de la barbería',
  })
  @IsString()
  @Length(5, 100)
  address: string;

  @ApiProperty({
    example: 'Ciudad de México',
    description: 'Ciudad de la barbería',
  })
  @IsString()
  @Length(2, 50)
  city: string;

  @ApiProperty({
    example: 'CDMX',
    description: 'Estado o provincia de la barbería',
  })
  @IsString()
  @Length(2, 50)
  state: string;

  @ApiProperty({
    example: '12345',
    description: 'Código postal de la barbería',
  })
  @IsString()
  @Length(5, 10)
  zipCode: string;

  @ApiPropertyOptional({
    example: 'Frente al parque central',
    description: 'Información adicional sobre la ubicación',
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  additionalInfo?: string;
}
