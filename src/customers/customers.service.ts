import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getCustomerProfile(userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
        barbershop: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async getCustomerAppointments(userId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { clientId: userId },
      orderBy: { appointmentDate: 'desc' },
      include: {
        barbershop: true,
        barberProfile: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return appointments;
  }

  async getAppointmentDetails(userId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clientId: userId,
      },
      include: {
        barbershop: true,
        barberProfile: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        payment: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getCustomerStatistics(userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId },
      include: {
        appointments: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const totalAppointments = customer.appointments.length;
    const totalSpent = customer.appointments.reduce((sum, appointment) => {
      return (
        sum +
        appointment.services.reduce((serviceSum, appointmentService) => {
          return serviceSum + appointmentService.service.price;
        }, 0)
      );
    }, 0);

    return {
      totalAppointments,
      totalSpent,
      averageRating: customer.averageRating,
      firstVisitDate: customer.firstVisitDate,
      lastVisitDate: customer.lastVisitDate,
    };
  }

  async getBarbershopCustomers(userId: string, barbershopId: string) {
    const barberProfile = await this.prisma.barberProfile.findFirst({
      where: { userId, barbershopId },
    });

    if (!barberProfile) {
      throw new ForbiddenException(
        "You are not authorized to view this barbershop's customers",
      );
    }

    const customers = await this.prisma.customer.findMany({
      where: { barbershopId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 5,
          include: {
            barberProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    return customers;
  }

  async getBarberCustomers(userId: string, barberId: string) {
    if (userId !== barberId) {
      throw new ForbiddenException(
        "You are not authorized to view this barber's customers",
      );
    }

    const customers = await this.prisma.customer.findMany({
      where: {
        appointments: {
          some: {
            barberProfile: {
              userId: barberId,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            phone: true,
          },
        },
        appointments: {
          where: {
            barberProfile: {
              userId: barberId,
            },
          },
          orderBy: { appointmentDate: 'desc' },
          take: 5,
          include: {
            barbershop: true,
            services: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    return customers;
  }
}
