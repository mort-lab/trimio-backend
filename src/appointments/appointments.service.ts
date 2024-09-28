// src/appointments/appointments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const { barberId, serviceId, barbershopId, appointmentDate } =
      createAppointmentDto;

    // Verificar si el usuario es un cliente
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'CLIENT') {
      throw new ForbiddenException('Only clients can create appointments');
    }

    // Crear la cita
    return this.prisma.appointment.create({
      data: {
        clientId: userId,
        barberId,
        serviceId,
        barbershopId,
        appointmentDate: new Date(appointmentDate),
        status: 'SCHEDULED',
      },
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    return this.prisma.appointment.findMany({
      skip,
      take: limit,
      include: {
        client: { select: { id: true, email: true } },
        barber: { select: { id: true, user: { select: { email: true } } } },
        service: true,
        barbershop: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, email: true } },
        barber: { select: { id: true, user: { select: { email: true } } } },
        service: true,
        barbershop: { select: { id: true, name: true } },
      },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      return await this.prisma.appointment.update({
        where: { id },
        data: updateAppointmentDto,
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

  async findByBarber(barberId: string, date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        barberId,
        appointmentDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        client: { select: { id: true, email: true } },
        service: true,
      },
    });
  }

  async findByBarbershop(barbershopId: string, date: string) {
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
      include: {
        client: { select: { id: true, email: true } },
        barber: { select: { id: true, user: { select: { email: true } } } },
        service: true,
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        barber: { select: { id: true, user: { select: { email: true } } } },
        service: true,
        barbershop: { select: { id: true, name: true } },
      },
    });
  }
}
