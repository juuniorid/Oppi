import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { User } from 'database/schema';
import { NotificationsController } from '../../src/notifications/notifications.controller';
import {
  NotificationsService,
  UserNotificationRow,
} from '../../src/notifications/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;

  const mockUser: User = {
    id: 7,
    email: 'parent@example.com',
    firstName: 'Pat',
    lastName: 'Parent',
    googleId: 'google_7',
    role: 'PARENT',
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNotifications: UserNotificationRow[] = [
    {
      id: 11,
      subject: 'New event',
      body: 'Spring trip details added',
      readAt: null,
      createdAt: new Date('2026-04-29T10:00:00.000Z'),
      audience: 'GROUP',
    },
    {
      id: 10,
      subject: 'Reminder',
      body: 'Bring indoor shoes',
      readAt: new Date('2026-04-28T09:00:00.000Z'),
      createdAt: new Date('2026-04-28T08:00:00.000Z'),
      audience: 'GROUP',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            listForUser: jest.fn().mockResolvedValue(mockNotifications),
            getUnreadCount: jest.fn().mockResolvedValue(1),
            markAllAsRead: jest.fn().mockResolvedValue(2),
            markAsRead: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return notifications for the authenticated user', async () => {
      const req = { user: mockUser } as Request & { user?: User };

      const result = await controller.list(req, 25);

      expect(notificationsService.listForUser).toHaveBeenCalledWith(
        mockUser.id,
        25
      );
      expect(result).toEqual({ notifications: mockNotifications });
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count for the authenticated user', async () => {
      const req = { user: mockUser } as Request & { user?: User };

      const result = await controller.getUnreadCount(req);

      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual({ unreadCount: 1 });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for the authenticated user', async () => {
      const req = { user: mockUser } as Request & { user?: User };

      const result = await controller.markAllAsRead(req);

      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual({ updatedCount: 2 });
    });
  });

  describe('markAsRead', () => {
    it('should mark one notification as read for the authenticated user', async () => {
      const req = { user: mockUser } as Request & { user?: User };

      const result = await controller.markAsRead(req, 11);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(
        11,
        mockUser.id
      );
      expect(result).toEqual({ updated: true });
    });
  });
});
