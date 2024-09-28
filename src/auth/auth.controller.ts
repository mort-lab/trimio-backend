// src/auth/auth.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or user already exists',
  })
  @Post('register')
  async register(@Body() dto: AuthDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() dto: AuthDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiOperation({ summary: 'Send a password recovery email' })
  @ApiResponse({ status: 200, description: 'Password recovery email sent' })
  @ApiResponse({ status: 400, description: 'Email not registered' })
  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: { email: string }) {
    try {
      return await this.authService.forgotPassword(emailDto.email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  async refreshToken(@Body() tokenDto: { refresh_token: string }) {
    try {
      return await this.authService.refreshToken(tokenDto.refresh_token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
