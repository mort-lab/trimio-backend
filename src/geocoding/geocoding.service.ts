import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocodingService {
  constructor(private readonly httpService: HttpService) {}

  async getCoordinates(address: string): Promise<{ lat: number; lng: number }> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;

      if (data.results.length === 0) {
        throw new HttpException(
          'No se encontraron resultados para la dirección proporcionada.',
          HttpStatus.NOT_FOUND,
        );
      }

      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } catch (error) {
      throw new HttpException(
        'Error al obtener coordenadas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
