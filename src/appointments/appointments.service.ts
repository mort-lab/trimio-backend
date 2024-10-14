import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { barbershopId, serviceIds, barberId, appointmentDate, customerId } =
      createAppointmentDto;

    // Validar si el usuario es un cliente válido
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customers: true },
    });

    if (!user || user.role !== 'CLIENT') {
      throw new BadRequestException('Invalid user or not a client');
    }

    let customer = null;

    // Si se proporciona un customerId, validarlo
    if (customerId) {
      customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer || customer.userId !== userId) {
        throw new BadRequestException('Invalid customer');
      }
    } else {
      // Si no se proporciona un customerId, usar el primer cliente del usuario
      if (!user.customers[0]) {
        throw new BadRequestException('User has no associated customer');
      }
      customer = user.customers[0];
    }

    // Validar la barbería
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    // Validar el perfil del barbero
    const barberProfile = await this.prisma.barberProfile.findFirst({
      where: { userId: barberId, barbershopId },
    });

    if (!barberProfile) {
      throw new BadRequestException('Barber not found in this barbershop');
    }

    // Validar los servicios
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        barbershopId,
      },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        'One or more services not found in this barbershop',
      );
    }

    // Crear la cita
    return this.prisma.appointment.create({
      data: {
        client: { connect: { id: userId } },
        customer: { connect: { id: customer.id } },
        barberProfile: { connect: { id: barberProfile.id } },
        barbershop: { connect: { id: barbershopId } },
        appointmentDate: new Date(appointmentDate),
        status: 'SCHEDULED',
        services: {
          create: serviceIds.map((serviceId) => ({
            service: { connect: { id: serviceId } },
          })),
        },
      },
      include: {
        services: { include: { service: true } },
        barberProfile: { include: { user: true } },
        barbershop: true,
        customer: true,
        client: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, email: true } },
        barberProfile: { include: { user: true } },
        services: { include: { service: true } },
        barbershop: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { serviceId, ...rest } = updateAppointmentDto;
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        services: serviceId
          ? {
              deleteMany: {},
              create: [{ service: { connect: { id: serviceId } } }],
            }
          : undefined,
      },
      include: {
        services: { include: { service: true } },
        barberProfile: { include: { user: true } },
        barbershop: true,
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.appointment.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async findByBarber(
    barberId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.appointment.findMany({
      where: { barberProfile: { userId: barberId } },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        services: { include: { service: true } },
        barbershop: { select: { id: true, name: true } },
      },
    });
  }

  async findByBarbershop(
    barbershopId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.appointment.findMany({
      where: { barbershopId },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        services: { include: { service: true } },
        barberProfile: { select: { user: { select: { email: true } } } },
      },
    });
  }
}
