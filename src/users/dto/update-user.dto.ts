// src/users/dto/update-user.dto.ts

import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'New email address of the user',
    example: 'newemail@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    description: 'New password for the user',
    example: 'Newpassword1!',
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Current password required for profile updates',
    example: 'OldPassword123!',
  })
  @IsOptional()
  @IsString({ message: 'Current password is required' })
  currentPassword?: string;
}
