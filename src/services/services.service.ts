import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: createServiceDto.barbershopId },
    });

    if (!barbershop) {
      throw new NotFoundException(
        `Barbershop with ID ${createServiceDto.barbershopId} not found`,
      );
    }

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
    return this.prisma.service.findMany({
      where: { deletedAt: null },
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

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const existingService = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (
      updateServiceDto.barbershopId &&
      existingService.barbershopId !== updateServiceDto.barbershopId
    ) {
      throw new BadRequestException(
        'Cannot change the barbershop of a service',
      );
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findByBarbershop(
    barbershopId: string,
    skip: number,
    take: number,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    return this.prisma.service.findMany({
      where: {
        barbershopId,
        deletedAt: null,
        ...(category && { category }),
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
