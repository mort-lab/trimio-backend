import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';

// google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
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
    const { emails } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({ where: { email } });

    // Crear usuario si no existe, con un rol por defecto de CLIENT
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          password: '', // No password for OAuth
          role: 'CLIENT', // Default role
        },
      });
    }

    return done(null, user);
  }
}
