// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Obtener perfil del usuario
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }, // Evitar devolver la contraseña
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return user;
  }

  // Actualizar perfil del usuario
  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const { email, password } = updateUserDto;

    const data: any = {};
    if (email) {
      // Verificar que el correo no esté en uso
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('El correo ya está en uso');
      }
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return { message: 'Perfil actualizado con éxito', user: updatedUser };
  }

  // Eliminar cuenta de usuario
  async deleteAccount(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Cuenta eliminada con éxito' };
  }
}
