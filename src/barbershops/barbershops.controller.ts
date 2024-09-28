// src/barbershops/barbershops.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BarbershopsService } from './barbershops.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateBarbershopDto } from './dto/create-barbershop.dto';
import { UpdateBarbershopDto } from './dto/update-barbershop.dto';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Barbershops')
@ApiBearerAuth()
@Controller('barbershops')
@UseGuards(JwtAuthGuard)
export class BarbershopsController {
  constructor(private readonly barbershopsService: BarbershopsService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() createBarbershopDto: CreateBarbershopDto,
  ) {
    return this.barbershopsService.create(user.id, createBarbershopDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateBarbershopDto: UpdateBarbershopDto,
  ) {
    return this.barbershopsService.update(id, user.id, updateBarbershopDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.barbershopsService.findAll({ page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbershopsService.findOne(id);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Obtener barberías cercanas a una ubicación' })
  findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius = 5000, // Radio en metros
  ) {
    return this.barbershopsService.findNearby(latitude, longitude, radius);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.remove(id, user.id);
  }
}
