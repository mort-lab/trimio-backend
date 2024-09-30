// src/appointments/appointments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { barberId, serviceIds, barbershopId, appointmentDate } =
      createAppointmentDto;

    const barberProfile = await this.prisma.barberProfile.findFirst({
      where: { userId: barberId, barbershopId },
    });
    if (!barberProfile) {
      throw new BadRequestException(
        'Barber does not belong to this barbershop',
      );
    }

    // Verify if the services belong to the barbershop
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, barbershopId },
    });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        'One or more services do not belong to this barbershop',
      );
    }

    // Create the appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: userId,
        barberProfileId: barberProfile.id,
        barbershopId,
        appointmentDate: new Date(appointmentDate),
        status: 'SCHEDULED',
        services: {
          create: serviceIds.map((serviceId) => ({
            service: { connect: { id: serviceId } },
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        barberProfile: {
          include: {
            user: true,
          },
        },
        barbershop: true,
      },
    });

    return appointment;
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    return this.prisma.appointment.findMany({
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        barberProfile: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        barbershop: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, email: true } },
        barberProfile: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        barbershop: { select: { id: true, name: true } },
      },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { serviceIds, ...rest } = updateAppointmentDto;

    try {
      return await this.prisma.appointment.update({
        where: { id },
        data: {
          ...rest,
          services: serviceIds
            ? {
                deleteMany: {},
                create: serviceIds.map((serviceId) => ({
                  service: { connect: { id: serviceId } },
                })),
              }
            : undefined,
        },
        include: {
          services: {
            include: {
              service: true,
            },
          },
          barberProfile: {
            include: {
              user: true,
            },
          },
          barbershop: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
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
    date: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        barberProfile: {
          userId: barberId,
        },
        appointmentDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        services: {
          include: {
            service: true,
          },
        },
        barbershop: { select: { id: true, name: true } },
      },
    });
  }

  async findByBarbershop(
    barbershopId: string,
    date: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        barbershopId,
        appointmentDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        barberProfile: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async findByClient(
    clientId: string,
    { page, limit }: { page: number; limit: number },
  ) {
    const skip = (page - 1) * limit;
    return this.prisma.appointment.findMany({
      where: { clientId },
      skip,
      take: limit,
      include: {
        barberProfile: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        barbershop: { select: { id: true, name: true } },
      },
    });
  }
}
