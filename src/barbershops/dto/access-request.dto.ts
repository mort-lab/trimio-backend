import { IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessRequestStatus } from '@prisma/client';

export class CreateAccessRequestDto {
  @ApiProperty({
    description: 'ID of the barbershop',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  barbershopId: string;
}

export class UpdateAccessRequestDto {
  @ApiProperty({
    description: 'New status of the access request',
    enum: AccessRequestStatus,
    example: AccessRequestStatus.APPROVED,
  })
  @IsEnum(AccessRequestStatus)
  status: AccessRequestStatus;
}
