// src/barbershops/barbershops.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarbershopDto } from './dto/create-barbershop.dto';
import { UpdateBarbershopDto } from './dto/update-barbershop.dto';

@Injectable()
export class BarbershopsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: number, createBarbershopDto: CreateBarbershopDto) {
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!['BARBER', 'ADMIN'].includes(owner.role)) {
      throw new ForbiddenException('No tienes permiso para crear una barbería');
    }

    return this.prisma.barbershop.create({
      data: {
        ...createBarbershopDto,
        ownerId,
      },
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    return this.prisma.barbershop.findMany({
      skip,
      take: limit,
    });
  }

  async findOne(id: number) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) {
      throw new NotFoundException('Barbería no encontrada');
    }
    return barbershop;
  }

  async update(
    id: number,
    ownerId: number,
    updateBarbershopDto: UpdateBarbershopDto,
  ) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) {
      throw new NotFoundException('Barbería no encontrada');
    }
    if (barbershop.ownerId !== ownerId) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta barbería',
      );
    }
    return this.prisma.barbershop.update({
      where: { id },
      data: updateBarbershopDto,
    });
  }

  async remove(id: number, ownerId: number) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) {
      throw new NotFoundException('Barbería no encontrada');
    }
    if (barbershop.ownerId !== ownerId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta barbería',
      );
    }
    return this.prisma.barbershop.delete({ where: { id } });
  }
}
