// src/barbershops/barbershops.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarbershopDto } from './dto/create-barbershop.dto';
import { UpdateBarbershopDto } from './dto/update-barbershop.dto';
import { Barbershop } from '@prisma/client';

@Injectable()
export class BarbershopsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, createBarbershopDto: CreateBarbershopDto) {
    return this.prisma.barbershop.create({
      data: {
        ...createBarbershopDto,
        ownerId,
      },
    });
  }

  async update(
    id: string,
    ownerId: string,
    updateBarbershopDto: UpdateBarbershopDto,
  ) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) throw new NotFoundException('Barbería no encontrada');
    if (barbershop.ownerId !== ownerId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta barbería',
      );

    return this.prisma.barbershop.update({
      where: { id },
      data: updateBarbershopDto,
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    return this.prisma.barbershop.findMany({ skip, take: limit });
  }

  async findOne(id: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) throw new NotFoundException('Barbería no encontrada');
    return barbershop;
  }

  async findNearby(latitude: number, longitude: number, radius: number) {
    const barbershops = await this.prisma.$queryRaw<Barbershop[]>`
      SELECT *, 
        ( 6371 * acos( cos( radians(${latitude}) ) 
        * cos( radians( latitude ) ) 
        * cos( radians( longitude ) - radians(${longitude}) ) 
        + sin( radians(${latitude}) ) 
        * sin( radians( latitude ) ) ) ) AS distance 
      FROM Barbershop
      HAVING distance < ${radius} / 1000
      ORDER BY distance
    `;
    return barbershops;
  }

  async remove(id: string, ownerId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) throw new NotFoundException('Barbería no encontrada');
    if (barbershop.ownerId !== ownerId)
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta barbería',
      );

    return this.prisma.barbershop.delete({ where: { id } });
  }
}
