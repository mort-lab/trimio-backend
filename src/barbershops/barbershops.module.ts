// src/barbershops/barbershops.module.ts
import { Module } from '@nestjs/common';
import { BarbershopsService } from './barbershops.service';
import { BarbershopsController } from './barbershops.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BarbershopsController],
  providers: [BarbershopsService, PrismaService],
})
export class BarbershopsModule {}
