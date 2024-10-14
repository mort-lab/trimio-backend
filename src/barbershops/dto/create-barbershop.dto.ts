import { IsString, Length, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBarbershopDto {
  @ApiProperty({
    example: 'Mort Barbershop',
    description: 'Nombre de la barbería',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    example: 'De pinares plaza 1',
    description: 'Dirección de la barbería',
  })
  @IsString()
  @Length(5, 100)
  address: string;

  @ApiProperty({
    example: 'Donostia',
    description: 'Ciudad de la barbería',
  })
  @IsString()
  @Length(2, 50)
  city: string;

  @ApiProperty({
    example: 'Gipuzkoa',
    description: 'Estado o provincia de la barbería',
  })
  @IsString()
  @Length(2, 50)
  state: string;

  @ApiProperty({
    example: '20018',
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
  additionalInfo?: string;

  @ApiPropertyOptional({
    example: '+34',
    description: 'Código de país del número de teléfono',
  })
  @IsOptional()
  @IsString()
  @Length(1, 5)
  countryCode?: string;

  @ApiPropertyOptional({
    example: '123456789',
    description: 'Número de teléfono de la barbería',
  })
  @IsOptional()
  @IsString()
  @Length(5, 15)
  phoneNumber?: string;
}
