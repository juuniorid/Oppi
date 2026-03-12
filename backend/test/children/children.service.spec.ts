import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../../src/children/children.service';
import * as database from 'database/db';
import { Child } from 'database/schema';

jest.mock('database/db');

describe('ChildrenService', () => {
  let service: ChildrenService;
  let mockDb: { select: jest.Mock };

  const mockChildren: Child[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockChildren),
          }),
        }),
      }),
    };

    (database as unknown as { db: { select: jest.Mock } }).db = mockDb;

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildrenService],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should return children for a specific group', async () => {
      const result = await service.findByGroup(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(mockChildren);
    });

    it('should return empty array when no children found', async () => {
      mockDb.select().from().innerJoin().where.mockResolvedValueOnce([]);

      const result = await service.findByGroup(99);

      expect(result).toEqual([]);
    });
  });
});
