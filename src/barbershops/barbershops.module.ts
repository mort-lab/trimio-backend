import { Module } from '@nestjs/common';
import { BarbershopsController } from './barbershops.controller';
import { BarbershopsService } from './barbershops.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingModule } from '../geocoding/geocoding.module'; // Importa GeocodingModule

@Module({
  imports: [GeocodingModule],
  controllers: [BarbershopsController],
  providers: [BarbershopsService, PrismaService],
})
export class BarbershopsModule {}
