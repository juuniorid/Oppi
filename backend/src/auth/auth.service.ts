import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { db } from '../database/db'; // Ensure correct relative path
import { users, User } from '../database/schema'; // Ensure correct relative path
import { JwtPayload } from '../common/dto/jwt.payload';

interface OAuthUser {
  email: string;
  name: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateOAuthLogin(user: OAuthUser): Promise<User> {
    // 1. Search by email first (the whitelist)
    const existingUsers = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
    
    if (existingUsers.length === 0) {
      // User is not pre-registered/invited
      throw new UnauthorizedException('You are not invited to this platform. Please contact an administrator.');
    }

    const dbUser = existingUsers[0];

    // 2. Link googleId if it's missing (claiming the invite)
    if (!dbUser.googleId) {
      const updatedUser = await db
        .update(users)
        .set({ googleId: user.googleId })
        .where(eq(users.id, dbUser.id))
        .returning();
      return updatedUser[0];
    }

    // 3. Ensure the googleId matches if it was already linked
    if (dbUser.googleId !== user.googleId) {
      throw new UnauthorizedException('This email is already linked to a different Google account.');
    }

    return dbUser;
  }

  async login(user: User): Promise<string> {
    // Include the role and sub in the payload for RBAC
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }
}