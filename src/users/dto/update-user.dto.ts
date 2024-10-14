import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsPhoneNumber,
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
    description: 'New username of the user',
    example: 'newusername123',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username?: string;

  @ApiPropertyOptional({
    description: 'New phone number of the user',
    example: '+521234567890',
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Invalid phone number' })
  phone?: string;

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
