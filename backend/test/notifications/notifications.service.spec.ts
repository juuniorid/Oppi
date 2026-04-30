import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../src/notifications/notifications.service';

jest.mock('database/db', () => {
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockWhere = jest.fn();
  const mockInnerJoin = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockUpdate = jest.fn();
  const mockSet = jest.fn();
  const mockReturning = jest.fn();

  return {
    db: {
      select: mockSelect.mockImplementation(() => ({
        from: mockFrom.mockImplementation(() => ({
          where: mockWhere,
          innerJoin: mockInnerJoin.mockImplementation(() => ({
            where: mockWhere.mockImplementation(() => ({
              orderBy: mockOrderBy.mockImplementation(() => ({
                limit: mockLimit,
              })),
            })),
          })),
        })),
      })),
      update: mockUpdate.mockImplementation(() => ({
        set: mockSet.mockImplementation(() => ({
          where: mockWhere.mockImplementation(() => ({
            returning: mockReturning,
          })),
        })),
      })),
    },
    __mocks: {
      mockSelect,
      mockFrom,
      mockWhere,
      mockInnerJoin,
      mockOrderBy,
      mockLimit,
      mockUpdate,
      mockSet,
      mockReturning,
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { __mocks } = require('database/db');

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUnreadCount', () => {
    it('should convert the database count to a number', async () => {
      __mocks.mockWhere.mockResolvedValueOnce([{ count: '3' }]);

      const result = await service.getUnreadCount(7);

      expect(result).toBe(3);
    });

    it('should return 0 when the database returns no count row', async () => {
      __mocks.mockWhere.mockResolvedValueOnce([]);

      const result = await service.getUnreadCount(7);

      expect(result).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should return how many rows were updated', async () => {
      __mocks.mockReturning.mockResolvedValueOnce([
        { notificationId: 11 },
        { notificationId: 12 },
      ]);

      const result = await service.markAllAsRead(7);

      expect(__mocks.mockSet).toHaveBeenCalledWith({
        readAt: expect.any(Date),
      });
      expect(result).toBe(2);
    });
  });

  describe('markAsRead', () => {
    it('should return true when one notification was updated', async () => {
      __mocks.mockReturning.mockResolvedValueOnce([{ notificationId: 11 }]);

      const result = await service.markAsRead(11, 7);

      expect(__mocks.mockSet).toHaveBeenCalledWith({
        readAt: expect.any(Date),
      });
      expect(result).toBe(true);
    });

    it('should return false when no notification row was updated', async () => {
      __mocks.mockReturning.mockResolvedValueOnce([]);

      const result = await service.markAsRead(11, 7);

      expect(result).toBe(false);
    });
  });

  describe('listForUser', () => {
    it('should return notification rows from the database', async () => {
      const rows = [
        {
          id: 11,
          subject: 'New event',
          body: 'Spring trip details added',
          readAt: null,
          createdAt: new Date('2026-04-29T10:00:00.000Z'),
          audience: 'GROUP',
        },
      ];
      __mocks.mockLimit.mockResolvedValueOnce(rows);

      const result = await service.listForUser(7, 25);

      expect(__mocks.mockLimit).toHaveBeenCalledWith(25);
      expect(result).toEqual(rows);
    });

    it('should cap the limit at 100', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([]);

      await service.listForUser(7, 1000);

      expect(__mocks.mockLimit).toHaveBeenCalledWith(100);
    });

    it('should raise the limit to at least 1', async () => {
      __mocks.mockLimit.mockResolvedValueOnce([]);

      await service.listForUser(7, 0);

      expect(__mocks.mockLimit).toHaveBeenCalledWith(1);
    });
  });
});
