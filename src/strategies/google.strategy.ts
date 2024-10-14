import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile?.emails?.[0]?.value;

    if (!email) {
      return done(
        new Error('No email associated with this Google account'),
        null,
      );
    }

    let user = await this.prisma.user.findUnique({ where: { email } });

    // Crear el usuario si no existe
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          password: '', // No password required for OAuth users
          role: 'CLIENT',
        },
      });
    }

    return done(null, user);
  }
}
