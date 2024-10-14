import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        clientId: 'client-uuid',
        customerId: 'customer-uuid',
        barberProfileId: 'barber-profile-uuid',
        barbershopId: 'barbershop-uuid',
        appointmentDate: '2024-09-30T10:00:00Z',
        status: 'SCHEDULED',
        services: [
          {
            service: {
              id: 'service-uuid',
              name: 'Haircut',
              price: 20,
            },
          },
        ],
      },
    },
  })
  create(
    @GetUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  @Get('barbershop/:barbershopId')
  @ApiOperation({ summary: 'Get all appointments by barbershop' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      example: [
        {
          id: 'appointment-uuid',
          client: { id: 'client-uuid', email: 'client@example.com' },
          barberProfile: {
            id: 'barber-profile-uuid',
            user: { email: 'barber@example.com' },
          },
          barbershop: { id: 'barbershop-uuid', name: 'Best Barbershop' },
          appointmentDate: '2024-09-30T10:00:00Z',
          services: [
            {
              service: {
                id: 'service-uuid',
                name: 'Haircut',
                price: 20,
              },
            },
          ],
        },
      ],
    },
  })
  findByBarbershop(
    @Param('barbershopId') barbershopId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.appointmentsService.findByBarbershop(barbershopId, {
      page: +page,
      limit: +limit,
    });
  }

  @Get('barber/:barberId')
  @ApiOperation({ summary: 'Get all appointments by barber' })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      example: [
        {
          id: 'appointment-uuid',
          client: { id: 'client-uuid', email: 'client@example.com' },
          barberProfile: {
            id: 'barber-profile-uuid',
            user: { email: 'barber@example.com' },
          },
          barbershop: { id: 'barbershop-uuid', name: 'Best Barbershop' },
          appointmentDate: '2024-09-30T10:00:00Z',
          services: [
            {
              service: {
                id: 'service-uuid',
                name: 'Haircut',
                price: 20,
              },
            },
          ],
        },
      ],
    },
  })
  findByBarber(
    @Param('barberId') barberId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.appointmentsService.findByBarber(barberId, {
      page: +page,
      limit: +limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the appointment',
    schema: {
      example: {
        id: 'appointment-uuid',
        client: { id: 'client-uuid', email: 'client@example.com' },
        barberProfile: {
          id: 'barber-profile-uuid',
          user: { email: 'barber@example.com' },
        },
        barbershop: { id: 'barbershop-uuid', name: 'Best Barbershop' },
        appointmentDate: '2024-09-30T10:00:00Z',
        services: [
          {
            service: {
              id: 'service-uuid',
              name: 'Haircut',
              price: 20,
            },
          },
        ],
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    schema: {
      example: {
        id: 'appointment-uuid',
        client: { id: 'client-uuid', email: 'client@example.com' },
        barberProfile: {
          id: 'barber-profile-uuid',
          user: { email: 'barber@example.com' },
        },
        barbershop: { id: 'barbershop-uuid', name: 'Best Barbershop' },
        appointmentDate: '2024-09-30T10:00:00Z',
        services: [
          {
            service: {
              id: 'service-uuid',
              name: 'Haircut',
              price: 20,
            },
          },
        ],
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment deleted successfully',
    schema: {
      example: {
        message: 'Appointment deleted successfully',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
