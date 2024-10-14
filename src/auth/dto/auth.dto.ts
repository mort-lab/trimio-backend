import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  Matches,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'The email format is incorrect' })
  email: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username for the user',
  })
  @IsString({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({
    example: '+34612345678',
    description: 'User phone number with country code',
  })
  @IsString({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format. It should include the country code.',
  })
  phone: string;

  @ApiProperty({
    example: 'CLIENT',
    enum: Role,
    description: 'User role, either CLIENT or BARBER',
  })
  @IsEnum(Role, { message: 'Role must be either CLIENT or BARBER' })
  role: Role;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'The email format is incorrect' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString({ message: 'Password is required' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'your-refresh-token',
    description: 'The refresh token',
  })
  @IsString({ message: 'Refresh token is required' })
  refresh_token: string;
}

export class GoogleLoginDto {
  @ApiProperty({
    example: 'google-oauth-token',
    description: 'Google OAuth token',
  })
  @IsString({ message: 'Google OAuth token is required' })
  token: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
