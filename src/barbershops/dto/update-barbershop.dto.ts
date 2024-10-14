import { IsString, IsOptional, Length } from 'class-validator';
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
    example: 'Nueva Calle 456',
    description: 'Nueva dirección de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  address?: string;

  @ApiPropertyOptional({
    example: 'Nueva Ciudad',
    description: 'Nueva ciudad de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  city?: string;

  @ApiPropertyOptional({
    example: 'Nuevo Estado',
    description: 'Nuevo estado o provincia de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  state?: string;

  @ApiPropertyOptional({
    example: '54321',
    description: 'Nuevo código postal de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(5, 10)
  zipCode?: string;

  @ApiPropertyOptional({
    example: '+34',
    description: 'Nuevo código de país del número de teléfono',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  countryCode?: string; // Actualización de código de país

  @ApiPropertyOptional({
    example: '123456789',
    description: 'Nuevo número de teléfono de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(5, 15)
  phoneNumber?: string; // Actualización del número de teléfono

  @ApiPropertyOptional({
    example: 'Al lado del nuevo centro comercial',
    description: 'Nueva información adicional sobre la ubicación',
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  additionalInfo?: string;
}
