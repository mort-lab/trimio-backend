import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarbershopDto } from './dto/create-barbershop.dto';
import { UpdateBarbershopDto } from './dto/update-barbershop.dto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { AccessRequestStatus, BarberRole } from '@prisma/client';
import {
  CreateAccessRequestDto,
  UpdateAccessRequestDto,
} from './dto/access-request.dto';

@Injectable()
export class BarbershopsService {
  constructor(
    private prisma: PrismaService,
    private geocodingService: GeocodingService,
  ) {}

  async createBarbershop(
    userId: string,
    createBarbershopDto: CreateBarbershopDto,
    barbershopImageUrls: string[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'BARBER') {
      throw new ForbiddenException('Only barbers can create barbershops');
    }

    const { address, city, state, zipCode } = createBarbershopDto;
    const fullAddress = `${address}, ${city}, ${state}, ${zipCode}`;

    const { lat: barbershopLatitude, lng: barbershopLongitude } =
      await this.geocodingService.getCoordinates(fullAddress);

    const barbershop = await this.prisma.barbershop.create({
      data: {
        name: createBarbershopDto.name,
        address: createBarbershopDto.address,
        city: createBarbershopDto.city,
        state: createBarbershopDto.state,
        zipCode: createBarbershopDto.zipCode,
        additionalInfo: createBarbershopDto.additionalInfo,
        countryCode: createBarbershopDto.countryCode,
        phoneNumber: createBarbershopDto.phoneNumber,
        lat: barbershopLatitude,
        lng: barbershopLongitude,
        barberProfiles: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        barbershopImages: {
          create: barbershopImageUrls.map((imageUrl) => ({ url: imageUrl })),
        },
      },
      include: {
        barbershopImages: true,
        barberProfiles: true,
      },
    });

    return {
      barbershopId: barbershop.id,
      barbershopName: barbershop.name,
      barbershopAddress: barbershop.address,
      barbershopCity: barbershop.city,
      barbershopState: barbershop.state,
      barbershopZipCode: barbershop.zipCode,
      barbershopLatitude: barbershop.lat,
      barbershopLongitude: barbershop.lng,
      barberProfiles: await Promise.all(
        barbershop.barberProfiles.map(async (profile) => {
          const user = await this.prisma.user.findUnique({
            where: { id: profile.userId },
          });
          return {
            userId: profile.userId,
            barberRole: profile.role,
            userName: user.username,
          };
        }),
      ),
      barbershopImages: barbershop.barbershopImages.map((image) => ({
        imageUrl: image.url,
      })),
    };
  }

  async updateBarbershop(
    barbershopId: string,
    userId: string,
    updateBarbershopDto: UpdateBarbershopDto,
    barbershopImageUrls: string[],
  ) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { barberProfiles: true },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');

    const userProfile = barbershop.barberProfiles.find(
      (profile) => profile.userId === userId,
    );
    if (!userProfile || userProfile.role !== 'OWNER') {
      throw new ForbiddenException(
        'You do not have permission to update this barbershop',
      );
    }

    const updatedBarbershop = await this.prisma.barbershop.update({
      where: { id: barbershopId },
      data: {
        ...updateBarbershopDto,
        barbershopImages: {
          create: barbershopImageUrls.map((imageUrl) => ({ url: imageUrl })),
        },
      },
      include: { barbershopImages: true },
    });

    return {
      barbershopId: updatedBarbershop.id,
      barbershopName: updatedBarbershop.name,
      barbershopAddress: updatedBarbershop.address,
      barbershopCity: updatedBarbershop.city,
      barbershopState: updatedBarbershop.state,
      barbershopZipCode: updatedBarbershop.zipCode,
      barbershopLatitude: updatedBarbershop.lat,
      barbershopLongitude: updatedBarbershop.lng,
      barbershopImages: updatedBarbershop.barbershopImages.map((image) => ({
        imageUrl: image.url,
      })),
    };
  }

  async findAllAccessibleBarbershops(userId: string) {
    const barbershops = await this.prisma.barbershop.findMany({
      where: {
        barberProfiles: {
          some: { userId },
        },
      },
      include: {
        barberProfiles: {
          include: { user: true },
        },
        barbershopImages: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      barbershops.map(async (barbershop) => ({
        barbershopId: barbershop.id,
        barbershopName: barbershop.name,
        barbershopAddress: barbershop.address,
        barbershopCity: barbershop.city,
        barbershopState: barbershop.state,
        barbershopZipCode: barbershop.zipCode,
        barbershopLatitude: barbershop.lat,
        barbershopLongitude: barbershop.lng,
        barberProfiles: barbershop.barberProfiles.map((profile) => ({
          userId: profile.userId,
          barberRole: profile.role,
          barberName: profile.user.username,
        })),
        barbershopImages: barbershop.barbershopImages.map((image) => ({
          imageUrl: image.url,
        })),
      })),
    );
  }

  async findNearbyBarbershops(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ) {
    const barbershops = await this.prisma.barbershop.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
      },
      include: {
        barbershopImages: true,
        services: true,
        barberProfiles: {
          include: { user: true },
        },
      },
    });

    return barbershops
      .filter((barbershop) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          barbershop.lat,
          barbershop.lng,
        );
        return distance <= radiusKm;
      })
      .map((barbershop) => ({
        barbershopId: barbershop.id,
        barbershopName: barbershop.name,
        barbershopAddress: barbershop.address,
        barbershopCity: barbershop.city,
        barbershopState: barbershop.state,
        barbershopZipCode: barbershop.zipCode,
        barbershopLatitude: barbershop.lat,
        barbershopLongitude: barbershop.lng,
        barbershopImages: barbershop.barbershopImages.map((image) => ({
          imageUrl: image.url,
        })),
        services: barbershop.services,
        barberProfiles: barbershop.barberProfiles.map((profile) => ({
          userId: profile.userId,
          barberRole: profile.role,
          barberName: profile.user.username,
        })),
      }));
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  async findOneBarbershop(barbershopId: string, userId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: {
        barberProfiles: { include: { user: true } },
        barbershopImages: true,
      },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');

    const userProfile = barbershop.barberProfiles.find(
      (profile) => profile.userId === userId,
    );
    if (!userProfile) {
      throw new ForbiddenException('You do not have access to this barbershop');
    }

    return {
      barbershopId: barbershop.id,
      barbershopName: barbershop.name,
      barbershopAddress: barbershop.address,
      barbershopCity: barbershop.city,
      barbershopState: barbershop.state,
      barbershopZipCode: barbershop.zipCode,
      barbershopLatitude: barbershop.lat,
      barbershopLongitude: barbershop.lng,
      userRole: userProfile.role,
      barberProfiles: barbershop.barberProfiles.map((profile) => ({
        userId: profile.userId,
        barberRole: profile.role,
        barberName: profile.user.username,
        userName: profile.user.username,
      })),
      barbershopImages: barbershop.barbershopImages.map((image) => ({
        imageUrl: image.url,
      })),
    };
  }

  async removeBarbershop(barbershopId: string, userId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { barberProfiles: true },
    });
    if (!barbershop) throw new NotFoundException('Barbershop not found');

    const userProfile = barbershop.barberProfiles.find(
      (profile) => profile.userId === userId,
    );
    if (!userProfile || userProfile.role !== 'OWNER') {
      throw new ForbiddenException(
        'You do not have permission to delete this barbershop',
      );
    }

    await this.prisma.barbershop.delete({ where: { id: barbershopId } });
    return { message: 'Barbershop successfully deleted' };
  }

  async createAccessRequest(
    userId: string,
    createAccessRequestDto: CreateAccessRequestDto,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'BARBER') {
      throw new ForbiddenException(
        'Only barbers can request access to barbershops',
      );
    }

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: createAccessRequestDto.barbershopId },
      include: { barberProfiles: true },
    });
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const existingRequest = await this.prisma.accessRequest.findFirst({
      where: {
        userId,
        barbershopId: createAccessRequestDto.barbershopId,
        status: AccessRequestStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException(
        'An access request is already pending for this barbershop',
      );
    }

    const accessRequest = await this.prisma.accessRequest.create({
      data: {
        userId,
        barbershopId: createAccessRequestDto.barbershopId,
        status: AccessRequestStatus.PENDING,
      },
    });

    return {
      message: 'Access request created successfully',
      accessRequestId: accessRequest.id,
      status: accessRequest.status,
    };
  }

  async updateAccessRequest(
    ownerId: string,
    accessRequestId: string,
    updateAccessRequestDto: UpdateAccessRequestDto,
  ) {
    const accessRequest = await this.prisma.accessRequest.findUnique({
      where: { id: accessRequestId },
      include: { barbershop: { include: { barberProfiles: true } } },
    });

    if (!accessRequest) {
      throw new NotFoundException('Access request not found');
    }

    const ownerProfile = accessRequest.barbershop.barberProfiles.find(
      (profile) =>
        profile.userId === ownerId && profile.role === BarberRole.OWNER,
    );

    if (!ownerProfile) {
      throw new ForbiddenException(
        'Only the barbershop owner can update access requests',
      );
    }

    const updatedAccessRequest = await this.prisma.accessRequest.update({
      where: { id: accessRequestId },
      data: { status: updateAccessRequestDto.status },
    });

    if (updateAccessRequestDto.status === AccessRequestStatus.APPROVED) {
      await this.prisma.barberProfile.create({
        data: {
          userId: accessRequest.userId,
          barbershopId: accessRequest.barbershopId,
          role: BarberRole.BARBER,
        },
      });
    }

    return {
      message: 'Access request updated successfully',
      accessRequestId: updatedAccessRequest.id,
      status: updatedAccessRequest.status,
    };
  }

  async getAccessRequests(barbershopId: string, ownerId: string) {
    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { barberProfiles: true },
    });

    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const ownerProfile = barbershop.barberProfiles.find(
      (profile) =>
        profile.userId === ownerId && profile.role === BarberRole.OWNER,
    );

    if (!ownerProfile) {
      throw new ForbiddenException(
        'Only the barbershop owner can view access requests',
      );
    }

    const accessRequests = await this.prisma.accessRequest.findMany({
      where: { barbershopId },
      include: { user: true },
    });

    return accessRequests.map((request) => ({
      accessRequestId: request.id,
      barberId: request.userId,
      barberName: request.user.username,
      barberEmail: request.user.email,
      status: request.status,
      createdAt: request.createdAt,
    }));
  }
}
