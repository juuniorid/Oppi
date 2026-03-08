import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { db } from 'database/db';
import { users, User, NewUser } from 'database/schema';
import { JwtPayload } from '../common/dto/jwt.payload';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateOAuthLogin(user: any): Promise<User> {
    let existingUser = await db.select().from(users).where(eq(users.googleId, user.googleId)).limit(1);
    if (existingUser.length === 0) {
      // For demo, assign role based on email or something, but here default to PARENT
      const newUser = await db.insert(users).values({
        email: user.email,
        name: user.name,
        googleId: user.googleId,
        role: 'PARENT', // TODO: determine role
      }).returning();
      return newUser[0];
    }
    return existingUser[0];
  }

  async login(user: User): Promise<string> {
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
