import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { db } from '../database/db';
import { users, User } from '../database/schema';
import { JwtPayload } from '../common/dto/jwt.payload';

interface OAuthUser {
  email: string;
  name: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async validateOAuthLogin(user: OAuthUser): Promise<User> {
    const [existingUser] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    if (!existingUser) {
      this.logger.warn(`Login rejected: email not in whitelist (${user.email})`);
      throw new UnauthorizedException('You are not invited to this platform. Please contact an administrator.');
    }

    if (!existingUser.googleId) {
      this.logger.log(`Linking Google account for invited user (${user.email})`);
      const [updatedUser] = await db
        .update(users)
        .set({ googleId: user.googleId })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    }

    if (existingUser.googleId !== user.googleId) {
      this.logger.warn(`Login rejected: googleId mismatch for email (${user.email})`);
      throw new UnauthorizedException('This email is already linked to a different Google account.');
    }

    this.logger.log(`User authenticated (${user.email})`);
    return existingUser;
  }

  async login(user: User): Promise<string> {
    this.logger.log(`Issuing JWT for user id=${user.id} role=${user.role}`);
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}