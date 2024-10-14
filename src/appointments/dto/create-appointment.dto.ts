import { IsUUID, IsDateString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID of the barbershop',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  barbershopId: string;

  @ApiProperty({
    description: 'Array of service IDs',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  serviceIds: string[];

  @ApiProperty({
    description: 'ID of the barber',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsUUID()
  barberId: string;

  @ApiProperty({
    description: 'Date and time of the appointment',
    example: '2024-03-15T14:30:00Z',
  })
  @IsDateString()
  appointmentDate: string;
}
