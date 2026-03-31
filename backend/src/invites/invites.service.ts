import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'database/db';
import { users, User } from 'database/schema';
import { MailerService } from '../mail/mailer.service';
import { CreateInviteDto } from '../common/dto/create-invite.dto';

const MAX_EMAIL_RETRIES = 3;

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
      // If the user already linked their Google account, they're fully registered
      if (existing.googleId) {
        throw new ConflictException('A user with this email is already registered.');
      }

      // User was invited before but hasn't logged in yet — resend the invite
      this.logger.log(`Resending invitation to existing invited user (${dto.email})`);
      await this.sendEmailWithRetry(dto.email, dto.role);
      return existing;
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: dto.email,
        role: dto.role,
      })
      .returning();

    this.logger.log(`Invited user created: ${newUser.email} (role=${newUser.role})`);

    await this.sendEmailWithRetry(dto.email, dto.role);

    return newUser;
  }

  private async sendEmailWithRetry(email: string, role: string): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES; attempt++) {
      try {
        await this.mailerService.sendInvitationEmail(email, role);
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Email send attempt ${attempt}/${MAX_EMAIL_RETRIES} failed for ${email}: ${lastError.message}`,
        );

        if (attempt < MAX_EMAIL_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    this.logger.error(
      `Failed to send invitation email to ${email} after ${MAX_EMAIL_RETRIES} attempts`,
      lastError?.stack,
    );
    throw lastError;
  }
}
