import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ABSENCE_ENUM, ROLE, type User } from 'database/schema';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { DashboardService } from '../../src/dashboard/dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: DashboardService;

  const mockFeed = [
    {
      id: 1,
      date: '2026-04-05',
      title: 'Daily description - Bumblebees',
      description: 'Today we played outside.',
      status: ABSENCE_ENUM.Present,
    },
  ];

  const mockUser: User = {
    id: 7,
    email: 'parent@example.com',
    firstName: 'Test',
    lastName: 'Parent',
    googleId: 'google-parent',
    role: ROLE.Parent,
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getFeed: jest.fn().mockResolvedValue(mockFeed),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFeed', () => {
    it('should delegate dashboard feed lookup to the service', async () => {
      const request = { user: mockUser } as Request & { user?: User };

      const result = await controller.getFeed(
        '2026-04-03',
        '2026-04-05',
        undefined,
        request
      );

      expect(dashboardService.getFeed).toHaveBeenCalledWith(
        mockUser,
        '2026-04-03',
        '2026-04-05',
        undefined
      );
      expect(result).toEqual(mockFeed);
    });

    it('should pass childId when provided', async () => {
      const request = { user: mockUser } as Request & { user?: User };

      await controller.getFeed('2026-04-03', '2026-04-05', 12, request);

      expect(dashboardService.getFeed).toHaveBeenCalledWith(
        mockUser,
        '2026-04-03',
        '2026-04-05',
        12
      );
    });

    it('should propagate service exceptions', async () => {
      jest
        .spyOn(dashboardService, 'getFeed')
        .mockRejectedValue(
          new BadRequestException('Multiple children found. Specify childId.')
        );
      const request = { user: mockUser } as Request & { user?: User };

      await expect(
        controller.getFeed('2026-04-03', '2026-04-05', undefined, request)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
