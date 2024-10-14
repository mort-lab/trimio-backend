import { IsUUID, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  // Add other fields that can be updated
}
