// src/appointments/dto/create-appointment.dto.ts
import { IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsUUID()
  barberId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsUUID()
  barbershopId: string;

  @ApiProperty({ example: '2023-05-01T10:00:00Z' })
  @IsDateString()
  @IsUUID()
  appointmentDate: string;
}
