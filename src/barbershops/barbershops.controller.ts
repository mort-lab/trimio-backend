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
  @ApiOperation({ summary: 'Create a new barbershop' })
  @ApiResponse({ status: 201, description: 'Barbershop created successfully.' })
  create(
    @GetUser() user: User,
    @Body() createBarbershopDto: CreateBarbershopDto,
  ) {
    return this.barbershopsService.create(user.id, createBarbershopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all barbershops accessible by the user' })
  @ApiResponse({
    status: 200,
    description: 'List of accessible barbershops retrieved successfully.',
  })
  findAllAccessible(
    @GetUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.barbershopsService.findAllAccessible(user.id, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a barbershop by ID' })
  @ApiResponse({
    status: 200,
    description: 'Barbershop retrieved successfully.',
  })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing barbershop' })
  @ApiResponse({ status: 200, description: 'Barbershop updated successfully.' })
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateBarbershopDto: UpdateBarbershopDto,
  ) {
    return this.barbershopsService.update(id, user.id, updateBarbershopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a barbershop' })
  @ApiResponse({ status: 200, description: 'Barbershop deleted successfully.' })
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.remove(id, user.id);
  }

  @Post(':id/request-access')
  @ApiOperation({ summary: 'Request access to a barbershop' })
  @ApiResponse({
    status: 201,
    description: 'Access request created successfully.',
  })
  requestAccess(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.requestAccess(id, user.id);
  }

  @Post('access-requests/:id/approve')
  @ApiOperation({ summary: 'Approve an access request' })
  @ApiResponse({
    status: 200,
    description: 'Access request approved successfully.',
  })
  approveAccessRequest(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.approveAccessRequest(id, user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search barbershops by city or zip code' })
  @ApiResponse({ status: 200, description: 'Barbershops found successfully.' })
  search(
    @Query('city') city: string,
    @Query('zipCode') zipCode: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.barbershopsService.search(city, zipCode, { page, limit });
  }
}
