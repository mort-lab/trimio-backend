// src/auth/auth.service.ts

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: AuthDto) {
    const { email, password, role } = dto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario con el rol seleccionado
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // Asigna el rol: BARBER o CLIENT
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      ...token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: AuthDto) {
    const { email, password } = dto;

    // Verifica si el usuario existe
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.generateToken(user.id, user.email);
    return {
      ...token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'), // Usar ConfigService
      });
      return this.generateToken(payload.sub, payload.email);
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('El correo no está registrado');
    }

    // Aquí puedes generar un token de recuperación y enviar un email
    // Luego el usuario podrá cambiar su contraseña mediante otro endpoint.

    return { message: 'Se ha enviado un enlace para recuperar la contraseña' };
  }
}
