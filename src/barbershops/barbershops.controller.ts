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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BarbershopsService } from './barbershops.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CreateBarbershopDto } from './dto/create-barbershop.dto';
import { UpdateBarbershopDto } from './dto/update-barbershop.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Express } from 'express';
import {
  CreateAccessRequestDto,
  UpdateAccessRequestDto,
} from './dto/access-request.dto';

@ApiTags('Barbershops')
@ApiBearerAuth()
@Controller('barbershops')
@UseGuards(JwtAuthGuard)
export class BarbershopsController {
  constructor(private readonly barbershopsService: BarbershopsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('barbershopImages', 10))
  @ApiOperation({ summary: 'Create a new barbershop' })
  @ApiBody({ type: CreateBarbershopDto })
  @ApiResponse({
    status: 201,
    description: 'Barbershop created successfully.',
    schema: {
      example: {
        barbershopId: 'uuid-barbershop',
        barbershopName: 'Central Barbershop',
        barbershopAddress: 'Calle Falsa 123',
        barbershopCity: 'Madrid',
        barbershopState: 'Madrid',
        barbershopZipCode: '28013',
        barbershopLatitude: 40.416775,
        barbershopLongitude: -3.70379,
        barberProfiles: [
          { userId: 'uuid-barber', barberRole: 'OWNER', barberName: 'Martin' },
        ],
        barbershopImages: [{ imageUrl: '/uploads/barbershops/image.jpg' }],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid data provided.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only barbers can create barbershops.',
  })
  async createBarbershop(
    @GetUser() user: User,
    @Body() createBarbershopDto: CreateBarbershopDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const barbershopImageUrls = files
      ? files.map((file) => `/uploads/barbershops/${file.filename}`)
      : [];
    return this.barbershopsService.createBarbershop(
      user.id,
      createBarbershopDto,
      barbershopImageUrls,
    );
  }

  @Put(':barbershopId')
  @UseInterceptors(FilesInterceptor('barbershopImages', 10))
  @ApiOperation({ summary: 'Update an existing barbershop' })
  @ApiParam({
    name: 'barbershopId',
    description: 'ID of the barbershop to update',
  })
  @ApiBody({ type: UpdateBarbershopDto })
  @ApiResponse({
    status: 200,
    description: 'Barbershop updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only the owner can update the barbershop.',
  })
  @ApiResponse({
    status: 404,
    description: 'Barbershop not found.',
  })
  async updateBarbershop(
    @Param('barbershopId') barbershopId: string,
    @GetUser() user: User,
    @Body() updateBarbershopDto: UpdateBarbershopDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const barbershopImageUrls = files
      ? files.map((file) => `/uploads/barbershops/${file.filename}`)
      : [];
    return this.barbershopsService.updateBarbershop(
      barbershopId,
      user.id,
      updateBarbershopDto,
      barbershopImageUrls,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all barbershops accessible by the user' })
  @ApiResponse({
    status: 200,
    description: 'List of accessible barbershops retrieved successfully.',
  })
  async findAllAccessibleBarbershops(@GetUser() user: User) {
    return this.barbershopsService.findAllAccessibleBarbershops(user.id);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get barbershops near the user by coordinates' })
  @ApiQuery({
    name: 'latitude',
    example: 40.416775,
    description: 'Latitude of the user',
  })
  @ApiQuery({
    name: 'longitude',
    example: -3.70379,
    description: 'Longitude of the user',
  })
  @ApiQuery({
    name: 'radiusKm',
    example: 10,
    description: 'Radius in kilometers (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Barbershops retrieved successfully based on coordinates.',
  })
  async findNearbyBarbershops(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm = 10,
  ) {
    return this.barbershopsService.findNearbyBarbershops(
      latitude,
      longitude,
      radiusKm,
    );
  }

  @Get(':barbershopId')
  @ApiOperation({ summary: 'Get a barbershop by ID' })
  @ApiParam({ name: 'barbershopId', description: 'ID of the barbershop' })
  @ApiResponse({
    status: 200,
    description: 'Barbershop retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Barbershop not found.',
  })
  async findOneBarbershop(
    @Param('barbershopId') barbershopId: string,
    @GetUser() user: User,
  ) {
    return this.barbershopsService.findOneBarbershop(barbershopId, user.id);
  }

  @Delete(':barbershopId')
  @ApiOperation({ summary: 'Delete a barbershop' })
  @ApiParam({
    name: 'barbershopId',
    description: 'ID of the barbershop to delete',
  })
  @ApiResponse({ status: 200, description: 'Barbershop deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only the owner can delete the barbershop.',
  })
  @ApiResponse({
    status: 404,
    description: 'Barbershop not found.',
  })
  async removeBarbershop(
    @Param('barbershopId') barbershopId: string,
    @GetUser() user: User,
  ) {
    return this.barbershopsService.removeBarbershop(barbershopId, user.id);
  }

  @Post('access-request')
  @ApiOperation({ summary: 'Create an access request for a barbershop' })
  @ApiBody({ type: CreateAccessRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Access request created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid data or duplicate request.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only barbers can request access.',
  })
  async createAccessRequest(
    @GetUser() user: User,
    @Body() createAccessRequestDto: CreateAccessRequestDto,
  ) {
    return this.barbershopsService.createAccessRequest(
      user.id,
      createAccessRequestDto,
    );
  }

  @Put('access-request/:accessRequestId')
  @ApiOperation({ summary: 'Update an access request status' })
  @ApiParam({
    name: 'accessRequestId',
    description: 'ID of the access request',
  })
  @ApiBody({ type: UpdateAccessRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Access request updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Only the barbershop owner can update access requests.',
  })
  @ApiResponse({
    status: 404,
    description: 'Access request not found.',
  })
  async updateAccessRequest(
    @GetUser() user: User,
    @Param('accessRequestId') accessRequestId: string,
    @Body() updateAccessRequestDto: UpdateAccessRequestDto,
  ) {
    return this.barbershopsService.updateAccessRequest(
      user.id,
      accessRequestId,
      updateAccessRequestDto,
    );
  }

  @Get(':barbershopId/access-requests')
  @ApiOperation({ summary: 'Get all access requests for a barbershop' })
  @ApiParam({ name: 'barbershopId', description: 'ID of the barbershop' })
  @ApiResponse({
    status: 200,
    description: 'Access requests retrieved successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Only the barbershop owner can view access requests.',
  })
  @ApiResponse({
    status: 404,
    description: 'Barbershop not found.',
  })
  async getAccessRequests(
    @GetUser() user: User,
    @Param('barbershopId') barbershopId: string,
  ) {
    return this.barbershopsService.getAccessRequests(barbershopId, user.id);
  }
}
