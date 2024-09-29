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
    example: 'Al lado del nuevo centro comercial',
    description: 'Nueva información adicional sobre la ubicación',
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  additionalInfo?: string;
}
