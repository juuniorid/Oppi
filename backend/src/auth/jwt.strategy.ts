import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { appConfig } from 'src/config';
import { JwtPayload } from 'src/common/dto/jwt.payload';
import { db } from 'database/db';
import { users, User } from 'database/schema';
import { and, eq, isNull } from 'drizzle-orm';

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

  async validate(payload: JwtPayload): Promise<User> {
    const found = await db
      .select()
      .from(users)
      .where(and(eq(users.id, payload.sub), isNull(users.deletedAt)))
      .limit(1);
    if (found.length === 0) {
      throw new UnauthorizedException('User not found');
    }
    return found[0];
  }
}
