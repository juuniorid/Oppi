import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { appConfig } from 'src/config';

interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  name: {
    givenName: string;
    familyName: string;
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: appConfig.google.clientId,
      clientSecret: appConfig.google.clientSecret,
      callbackURL: appConfig.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ): Promise<void> {
    const { emails, id, name } = profile;
    const user = {
      email: emails[0].value,
      googleId: id,
      firstName: name.givenName ?? null,
      lastName: name.familyName ?? null,
    };
    const validatedUser = await this.authService.validateOAuthLogin(user);
    done(null, validatedUser);
  }
}
