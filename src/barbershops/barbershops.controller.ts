import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  Query,
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

@ApiTags('barbershops') // Añadir el tag para barbershops
@ApiBearerAuth()
@Controller('barbershops')
@UseGuards(JwtAuthGuard)
export class BarbershopsController {
  constructor(private readonly barbershopsService: BarbershopsService) {}

  @ApiOperation({ summary: 'Create a new barbershop' })
  @ApiResponse({ status: 201, description: 'Barbershop successfully created' })
  @Post()
  create(
    @GetUser() user: User,
    @Body() createBarbershopDto: CreateBarbershopDto,
  ) {
    return this.barbershopsService.create(user.id, createBarbershopDto);
  }

  @ApiOperation({ summary: 'List all barbershops with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched barbershop list',
  })
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.barbershopsService.findAll({ page, limit });
  }

  @ApiOperation({ summary: 'Get a barbershop by ID' })
  @ApiResponse({ status: 200, description: 'Successfully fetched barbershop' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbershopsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an existing barbershop' })
  @ApiResponse({ status: 200, description: 'Barbershop successfully updated' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateBarbershopDto: UpdateBarbershopDto,
  ) {
    return this.barbershopsService.update(+id, user.id, updateBarbershopDto);
  }

  @ApiOperation({ summary: 'Delete a barbershop' })
  @ApiResponse({ status: 200, description: 'Barbershop successfully deleted' })
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.barbershopsService.remove(+id, user.id);
  }
}
