import { Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'database/schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

/**
 * Notifications HTTP API.
 *
 * Exposes authenticated endpoints used by the UI to keep the header
 * notification bell aligned with server-side unread state.
 */
@ApiTags('notifications')
@ApiCookieAuth('jwt')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications count returned successfully.',
  })
  /**
   * Returns unread badge value for the currently authenticated user.
   */
  async getUnreadCount(
    @Req() req: Request & { user?: User }
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationsService.getUnreadCount(
      req.user!.id
    );

    return { unreadCount };
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all unread notifications as read for current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notifications were marked as read.',
  })
  async markAllAsRead(
    @Req() req: Request & { user?: User }
  ): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notificationsService.markAllAsRead(
      req.user!.id
    );

    return { updatedCount };
  }
}
