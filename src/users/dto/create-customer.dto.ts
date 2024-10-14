import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'ID del usuario que es cliente',
    example: 'user-uuid',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID de la barbería',
    example: 'barbershop-uuid',
  })
  @IsUUID()
  barbershopId: string;
}
