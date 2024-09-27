// src/barbershops/dto/update-barbershop.dto.ts
import { IsString, IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Nota: ApiPropertyOptional es para campos opcionales

export class UpdateBarbershopDto {
  @ApiPropertyOptional({
    example: 'Barbería Nueva',
    description: 'Nuevo nombre de la barbería (opcional)',
  })
  @IsString()
  @IsOptional()
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Calle Nueva 123',
    description: 'Nueva ubicación de la barbería (opcional)',
  })
  @IsString()
  @IsOptional()
  @Length(5, 100, {
    message: 'La ubicación debe tener entre 5 y 100 caracteres',
  })
  location?: string;
}
