// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { BarbershopsModule } from './barbershops/barbershops.module';
import { ServicesModule } from './services/services.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    BarbershopsModule,
    ServicesModule,
    AppointmentsModule,
    CustomersModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
