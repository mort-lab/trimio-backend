import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: CreateServiceDto) {
    try {
      return await this.prisma.service.update({
        where: { id },
        data: updateServiceDto,
      });
    } catch (error) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.service.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async findByBarbershop(barbershopId: number) {
    return this.prisma.service.findMany({
      where: { barbershopId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
