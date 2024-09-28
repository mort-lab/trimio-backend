// src/barbershops/dto/create-barbershop.dto.ts
import { IsString, Length, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBarbershopDto {
  @ApiProperty({
    example: 'Central Barbershop',
    description: 'Nombre de la barbería',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    example: 'Downtown City',
    description: 'Ubicación de la barbería',
  })
  @IsString()
  @Length(5, 100)
  location: string;

  @ApiProperty({ example: 40.7128, description: 'Latitud de la barbería' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -74.006, description: 'Longitud de la barbería' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
