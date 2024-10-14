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
  Req,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'The service has been successfully created.',
  })
  create(@Body() createServiceDto: CreateServiceDto, @Req() req: Request) {
    const user = req.user as any; // Type assertion, adjust based on your actual user object structure
    return this.servicesService.create(createServiceDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({
    status: 200,
    description: 'Return all services.',
  })
  findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @Req() req: Request,
  ) {
    const user = req.user as any; // Type assertion, adjust based on your actual user object structure
    return this.servicesService.findAll(+skip, +take, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the service.',
  })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any; // Type assertion, adjust based on your actual user object structure
    return this.servicesService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: Request,
  ) {
    const user = req.user as any; // Type assertion, adjust based on your actual user object structure
    return this.servicesService.update(id, updateServiceDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully deleted.',
  })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any; // Type assertion, adjust based on your actual user object structure
    return this.servicesService.remove(id, user);
  }

  @Get('barbershop/:id')
  @ApiOperation({ summary: 'Get all services for a specific barbershop' })
  @ApiResponse({
    status: 200,
    description: 'Return all services for the specified barbershop.',
  })
  findByBarbershop(
    @Param('id') id: string,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.servicesService.findByBarbershop(id, +skip, +take);
  }
}
