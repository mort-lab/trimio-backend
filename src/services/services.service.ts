// src/services/services.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    // Validación para evitar duplicados
    const existingService = await this.prisma.service.findFirst({
      where: {
        barbershopId: createServiceDto.barbershopId,
        serviceName: createServiceDto.serviceName,
      },
    });

    if (existingService) {
      throw new BadRequestException(
        'Service with this name already exists in the barbershop',
      );
    }

    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll(skip: number, take: number) {
    // Excluir servicios eliminados
    return this.prisma.service.findMany({
      where: { deletedAt: null }, // Excluye servicios eliminados
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, updateServiceDto: CreateServiceDto) {
    try {
      return await this.prisma.service.update({
        where: { id },
        data: updateServiceDto,
      });
    } catch (error) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    // Soft delete actualizando el campo deletedAt
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() }, // Marca la eliminación lógica
    });
  }

  async findByBarbershop(barbershopId: string, skip: number, take: number) {
    // Excluir servicios eliminados
    return this.prisma.service.findMany({
      where: {
        barbershopId,
        deletedAt: null, // Excluye servicios eliminados
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
