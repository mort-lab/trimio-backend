// src/appointments/appointments.controller.ts
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  create(
    @GetUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'Return all appointments' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.appointmentsService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiResponse({ status: 200, description: 'Return the appointment' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('barber/:id')
  @ApiOperation({ summary: 'Get appointments for a specific barber' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the barber',
  })
  findByBarber(@Param('id') barberId: string, @Query('date') date: string) {
    return this.appointmentsService.findByBarber(barberId, date);
  }

  @Get('barbershop/:id')
  @ApiOperation({ summary: 'Get appointments for a specific barbershop' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the barbershop',
  })
  findByBarbershop(
    @Param('id') barbershopId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.findByBarbershop(barbershopId, date);
  }

  @Get('client/:id')
  @ApiOperation({ summary: 'Get appointments for a specific client' })
  @ApiResponse({
    status: 200,
    description: 'Return appointments for the client',
  })
  findByClient(@Param('id') clientId: string) {
    return this.appointmentsService.findByClient(clientId);
  }
}
