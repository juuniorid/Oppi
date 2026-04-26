import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/**
 * Notifications domain module.
 *
 * Wires the controller and service used by the header bell integration
 * so clients can fetch unread notification metadata for the current user.
 */
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
