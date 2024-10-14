import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get customer profile' })
  @ApiResponse({ status: 200, description: 'Returns the customer profile' })
  async getProfile(@GetUser() user: User) {
    return this.customersService.getCustomerProfile(user.id);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get customer appointments' })
  @ApiResponse({
    status: 200,
    description: 'Returns the customer appointments',
  })
  async getAppointments(@GetUser() user: User) {
    return this.customersService.getCustomerAppointments(user.id);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiResponse({ status: 200, description: 'Returns the appointment details' })
  @ApiParam({ name: 'id', type: 'string', description: 'Appointment ID' })
  async getAppointmentDetails(
    @GetUser() user: User,
    @Param('id') appointmentId: string,
  ) {
    return this.customersService.getAppointmentDetails(user.id, appointmentId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Returns the customer statistics' })
  async getStatistics(@GetUser() user: User) {
    return this.customersService.getCustomerStatistics(user.id);
  }

  @Get('barbershop/:barbershopId')
  @ApiOperation({ summary: 'Get customers for a barbershop' })
  @ApiResponse({ status: 200, description: 'Returns the barbershop customers' })
  @ApiParam({
    name: 'barbershopId',
    type: 'string',
    description: 'Barbershop ID',
  })
  async getBarbershopCustomers(
    @GetUser() user: User,
    @Param('barbershopId') barbershopId: string,
  ) {
    return this.customersService.getBarbershopCustomers(user.id, barbershopId);
  }

  @Get('barber/:barberId')
  @ApiOperation({ summary: 'Get customers for a barber' })
  @ApiResponse({ status: 200, description: "Returns the barber's customers" })
  @ApiParam({ name: 'barberId', type: 'string', description: 'Barber ID' })
  async getBarberCustomers(
    @GetUser() user: User,
    @Param('barberId') barberId: string,
  ) {
    return this.customersService.getBarberCustomers(user.id, barberId);
  }
}
