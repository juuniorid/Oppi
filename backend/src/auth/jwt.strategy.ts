import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from 'src/config';
import { JwtPayload } from 'src/common/dto/jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req): string | null => {
          return req?.cookies?.jwt;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: number; email: string; role: JwtPayload['role'] }> {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
