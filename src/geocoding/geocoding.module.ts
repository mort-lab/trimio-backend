import { Module } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class GeocodingModule {}
