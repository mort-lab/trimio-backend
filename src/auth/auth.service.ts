import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async register(dto: RegisterDto) {
    const { email, password, username, phone, role } = dto;

    if (role !== Role.CLIENT && role !== Role.BARBER) {
      throw new ForbiddenException(
        'Invalid role. Only CLIENT and BARBER can register.',
      );
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          phone,
          role,
          emailVerified: false,
        },
      });

      if (role === Role.CLIENT) {
        const defaultBarbershop = await this.prisma.barbershop.findFirst();
        if (!defaultBarbershop) {
          throw new BadRequestException('No default barbershop found');
        }

        await this.prisma.customer.create({
          data: {
            userId: user.id,
            barbershopId: defaultBarbershop.id,
          },
        });
      }

      const verificationToken = uuidv4();
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: verificationToken },
      });

      await this.sendVerificationEmail(user.email, verificationToken);

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        message: 'User registered successfully. Please verify your email.',
        userId: user.id,
        email: user.email,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field.includes('email')) {
            throw new ConflictException('Email is already registered');
          } else if (field.includes('username')) {
            throw new ConflictException('Username is already taken');
          }
        }
      }
      throw new InternalServerErrorException('Error during registration');
    }
  }

  private async sendVerificationEmail(email: string, token: string) {
    const mailOptions = {
      from: `"Trimio" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to Trimio!!💈✂️</h1>
        <p>Please click the following link to verify your email:</p>
        <a href="${this.configService.get('APP_URL')}/auth/verify-email?token=${token}">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: null, emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { customers: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      message: 'Login successful',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
        customerId: user.customers[0]?.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    const resetToken = uuidv4();
    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) },
    });

    await this.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const mailOptions = {
      from: `"Trimio" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click the following link to reset your password:</p>
        <a href="${this.configService.get('APP_URL')}/auth/reset-password?token=${token}">Reset Password</a>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const refreshTokenMatches = await bcrypt.compare(
        token,
        user.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  public async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async googleLogin(googleUser: { id: string; email: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { customers: true },
    });

    if (!user) {
      const defaultPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          password: hashedPassword,
          role: Role.CLIENT,
          emailVerified: true,
        },
        include: { customers: true },
      });

      const defaultBarbershop = await this.prisma.barbershop.findFirst();
      if (defaultBarbershop) {
        await this.prisma.customer.create({
          data: {
            userId: user.id,
            barbershopId: defaultBarbershop.id,
          },
        });
      }

      user = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { customers: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      message: 'Login successful',
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
        customerId: user.customers[0]?.id,
      },
      ...tokens,
    };
  }
}
