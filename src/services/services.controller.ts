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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

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
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'Return all services.' })
  findAll(@Query('skip') skip = 0, @Query('take') take = 10) {
    return this.servicesService.findAll(+skip, +take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  @ApiResponse({ status: 200, description: 'Return the service.' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a service' })
  @ApiResponse({
    status: 200,
    description: 'The service has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
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
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.servicesService.findByBarbershop(
      id,
      +skip,
      +take,
      category,
      minPrice,
      maxPrice,
    );
  }
}
