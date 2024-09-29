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

  async create(userId: string, createBarbershopDto: CreateBarbershopDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'BARBER')
      throw new ForbiddenException('Only barbers can create barbershops');

    return this.prisma.barbershop.create({
      data: {
        ...createBarbershopDto,
        ownerId: userId,
        barbers: {
          create: {
            userId: userId, // Asegúrate que estás creando correctamente el barbero
          },
        },
      },
      include: {
        barbers: true,
      },
    });
  }

  async findAllAccessible(
    userId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;
    return this.prisma.barbershop.findMany({
      where: {
        OR: [{ ownerId: userId }, { barbers: { some: { userId } } }],
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
      include: { owner: true, barbers: true },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');

    const hasAccess =
      barbershop.ownerId === userId ||
      barbershop.barbers.some((barber) => barber.userId === userId);
    if (!hasAccess)
      throw new ForbiddenException('You do not have access to this barbershop');

    return barbershop;
  }

  async update(
    id: string,
    userId: string,
    updateBarbershopDto: UpdateBarbershopDto,
  ) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');
    if (barbershop.ownerId !== userId)
      throw new ForbiddenException(
        'You do not have permission to update this barbershop',
      );

    return this.prisma.barbershop.update({
      where: { id },
      data: updateBarbershopDto,
    });
  }

  async remove(id: string, userId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');
    if (barbershop.ownerId !== userId)
      throw new ForbiddenException(
        'You do not have permission to delete this barbershop',
      );

    return this.prisma.barbershop.delete({ where: { id } });
  }

  async requestAccess(barbershopId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'BARBER')
      throw new ForbiddenException(
        'Only barbers can request access to barbershops',
      );

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { barbers: true },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');

    const alreadyHasAccess = barbershop.barbers.some(
      (barber) => barber.userId === userId,
    );
    if (alreadyHasAccess)
      throw new ForbiddenException(
        'You already have access to this barbershop',
      );

    const accessRequest = await this.prisma.accessRequest.create({
      data: {
        barbershopId,
        userId,
        status: 'PENDING',
      },
    });

    // Aquí podrías implementar una notificación al propietario de la barbería

    return accessRequest;
  }

  async approveAccessRequest(requestId: string, ownerId: string) {
    const accessRequest = await this.prisma.accessRequest.findUnique({
      where: { id: requestId },
      include: { barbershop: true },
    });
    if (!accessRequest) throw new NotFoundException('Access request not found');
    if (accessRequest.barbershop.ownerId !== ownerId)
      throw new ForbiddenException(
        'Only the barbershop owner can approve access requests',
      );

    await this.prisma.$transaction([
      this.prisma.accessRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      }),
      this.prisma.barber.create({
        data: {
          userId: accessRequest.userId,
          barbershopId: accessRequest.barbershopId,
        },
      }),
    ]);

    return { message: 'Access request approved successfully' };
  }

  async search(
    city: string,
    zipCode: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;
    return this.prisma.barbershop.findMany({
      where: {
        OR: [
          { city: { contains: city, mode: 'insensitive' } },
          { zipCode: zipCode },
        ],
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
