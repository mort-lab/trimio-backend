import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    userRole: string,
    updateUserDto: UpdateUserDto,
  ) {
    const { email, password, currentPassword, username, phone } = updateUserDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Si intenta cambiar la contraseña, verificar la actual
    if (password) {
      const passwordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordValid) {
        throw new UnauthorizedException('Incorrect current password');
      }
      user.password = await bcrypt.hash(password, 10);
    }

    const data: any = {};

    if (email) {
      // Validación de unicidad del email
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email is already in use');
      }
      data.email = email;
    }

    if (username) {
      // Validar si el username ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Username is already in use');
      }
      data.username = username;
    }

    if (phone) {
      data.phone = phone;
    }

    // Guardar los cambios auditando quién los hizo
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    // Registrar auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'update_profile',
        changes: JSON.stringify(updateUserDto),
        updatedAt: new Date(),
      },
    });

    return { message: 'Profile updated successfully', user: updatedUser };
  }

  async deleteAccount(userId: string, currentPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verificar la contraseña actual antes de eliminar
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }

    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Account deleted successfully' };
  }
}
