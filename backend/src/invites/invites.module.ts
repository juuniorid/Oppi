import { Module } from '@nestjs/common';
import { MailerModule } from '../mail/mailer.module';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [MailerModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
