import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User, BarberRole } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, user: User) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: createServiceDto.barbershopId },
      include: { barberProfiles: true },
    });

    if (!barbershop) {
      throw new NotFoundException(
        `Barbershop with ID ${createServiceDto.barbershopId} not found`,
      );
    }

    const userProfile = barbershop.barberProfiles.find(
      (profile) => profile.userId === user.id,
    );

    if (!userProfile || userProfile.role !== BarberRole.OWNER) {
      throw new ForbiddenException(
        'Only barbershop owners can create services',
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

  async findAll(skip: number, take: number, user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view all services');
    }

    return this.prisma.service.findMany({
      where: { deletedAt: null },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: User) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { barbershop: { include: { barberProfiles: true } } },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    if (user.role === 'CLIENT') {
      return service;
    }

    const userProfile = service.barbershop.barberProfiles.find(
      (profile) => profile.userId === user.id,
    );

    if (!userProfile) {
      throw new ForbiddenException('You do not have access to this service');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, user: User) {
    const existingService = await this.prisma.service.findUnique({
      where: { id },
      include: { barbershop: { include: { barberProfiles: true } } },
    });

    if (!existingService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const userProfile = existingService.barbershop.barberProfiles.find(
      (profile) => profile.userId === user.id,
    );

    if (!userProfile || userProfile.role !== BarberRole.OWNER) {
      throw new ForbiddenException(
        'Only barbershop owners can update services',
      );
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

  async remove(id: string, user: User) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { barbershop: { include: { barberProfiles: true } } },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    const userProfile = service.barbershop.barberProfiles.find(
      (profile) => profile.userId === user.id,
    );

    if (!userProfile || userProfile.role !== BarberRole.OWNER) {
      throw new ForbiddenException(
        'Only barbershop owners can delete services',
      );
    }

    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findByBarbershop(barbershopId: string, skip: number, take: number) {
    return this.prisma.service.findMany({
      where: {
        barbershopId,
        deletedAt: null,
        isActive: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
