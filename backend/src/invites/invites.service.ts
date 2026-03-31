import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'database/db';
import { users, User } from 'database/schema';
import { MailerService } from '../mail/mailer.service';
import { CreateInviteDto } from '../common/dto/create-invite.dto';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(private readonly mailerService: MailerService) {}

  async createInvite(dto: CreateInviteDto): Promise<User> {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing) {
      throw new ConflictException('A user with this email has already been invited or registered.');
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: dto.email,
        firstName: null,
        lastName: null,
        role: dto.role,
        googleId: null,
      })
      .returning();

    this.logger.log(`Invited user created: ${newUser.email} (role=${newUser.role})`);

    await this.mailerService.sendInvitationEmail(dto.email, dto.role);

    return newUser;
  }
}
