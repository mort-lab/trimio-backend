import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from 'src/appointments/dto/create-appointment.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // Obtener el perfil del cliente con datos del usuario y citas
  async getCustomerProfile(userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            phone: true,
          },
        },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            barbershop: {
              select: {
                name: true,
                address: true,
                city: true,
              },
            },
            services: {
              select: {
                service: {
                  select: {
                    serviceName: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { appointmentDate: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      id: customer.id,
      user: customer.user,
      totalSpent: customer.totalSpent, // Asegúrate de que esto esté bien almacenado en la base de datos
      appointmentCount: customer.appointmentCount, // Lo mismo para appointmentCount
      appointments: customer.appointments,
    };
  }

  // Crear una nueva cita y actualizar el total gastado por el cliente
  async createAppointment(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    const { barbershopId, serviceIds, barberId, appointmentDate } =
      createAppointmentDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customers: true },
    });

    if (!user || user.role !== 'CLIENT' || !user.customers[0]) {
      throw new BadRequestException('Invalid user or not a client');
    }

    const customer = user.customers[0];

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const barberProfile = await this.prisma.barberProfile.findFirst({
      where: { userId: barberId, barbershopId },
    });

    if (!barberProfile) {
      throw new BadRequestException('Barber not found in this barbershop');
    }

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

    const totalPrice = services.reduce(
      (sum, service) => sum + service.price,
      0,
    );

    // Crear la cita
    const appointment = await this.prisma.appointment.create({
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

    // Actualizar el total gastado por el cliente y el número de citas
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent: { increment: totalPrice }, // Incrementa el total gastado
        appointmentCount: { increment: 1 }, // Incrementa la cantidad de citas
      },
    });

    return appointment;
  }

  // Obtener las citas del cliente
  async getCustomerAppointments(userId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { customer: { userId } },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            additionalInfo: true,
            countryCode: true,
            phoneNumber: true,
            lat: true,
            lng: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                serviceName: true,
                price: true,
                description: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });

    if (!appointments.length) {
      throw new NotFoundException('No appointments found for this customer');
    }

    return appointments;
  }

  // Obtener estadísticas del cliente
  async getCustomerStatistics(userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId },
      select: {
        totalSpent: true,
        appointmentCount: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      totalSpent: customer.totalSpent,
      appointmentCount: customer.appointmentCount,
    };
  }

  // Obtener clientes de una barbería específica
  async getBarbershopCustomers(userId: string, barbershopId: string) {
    const customers = await this.prisma.customer.findMany({
      where: {
        appointments: {
          some: {
            barbershopId,
          },
        },
      },
      include: {
        user: { select: { email: true, username: true } },
        appointments: { select: { id: true, appointmentDate: true } },
      },
    });

    if (!customers.length) {
      throw new NotFoundException('No customers found for this barbershop');
    }

    return customers;
  }

  // Obtener barberías favoritas del cliente
  async getFavoriteBarbershops(userId: string) {
    const favoriteBarbershops = await this.prisma.favoriteBarbershop.findMany({
      where: { userId },
      include: {
        barbershop: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    if (!favoriteBarbershops.length) {
      throw new NotFoundException('No favorite barbershops found');
    }

    return favoriteBarbershops.map((favorite) => favorite.barbershop);
  }
}
