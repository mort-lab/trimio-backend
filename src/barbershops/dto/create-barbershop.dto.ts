// src/barbershops/dto/create-barbershop.dto.ts
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBarbershopDto {
  @ApiProperty({
    example: 'Central Barbershop',
    description: 'Name of the barbershop',
  })
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters long' })
  name: string;

  @ApiProperty({
    example: 'Downtown City',
    description: 'Location of the barbershop',
  })
  @IsString()
  @Length(5, 100, {
    message: 'Location must be between 5 and 100 characters long',
  })
  location: string;
}
