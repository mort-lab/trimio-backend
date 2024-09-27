// src/auth/dto/auth.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    example: 'CLIENT',
    enum: Role,
    description: 'User role, either CLIENT or BARBER',
  })
  @IsEnum(Role, { message: 'Role must be either CLIENT or BARBER' })
  role: Role;
}
