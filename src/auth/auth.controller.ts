import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  GoogleLoginDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already in use',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Send a password recovery email' })
  @ApiResponse({
    status: 200,
    description: 'Password recovery email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Email not registered',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @ApiOperation({ summary: 'Google OAuth Login' })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Google OAuth token is invalid',
  })
  @Post('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(
    @Req() req: Request & { user: { id: string; email: string } },
  ) {
    return this.authService.googleLogin(req.user);
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const tokens = await this.authService.generateTokens(user.id, user.email);

    // Redirección según el tipo de usuario
    const redirectUrl =
      user.role === 'BARBER'
        ? this.configService.get('GOOGLE_REDIRECT_URL_BARBER_NEXT')
        : this.configService.get('GOOGLE_REDIRECT_URL_CLIENT_EXPO');

    return res.redirect(`${redirectUrl}?jwtUser=${tokens.access_token}`);
  }

  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
