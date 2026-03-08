import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../../src/children/children.service';
import * as database from 'database/db';
import { Child } from 'database/schema';

jest.mock('database/db');

describe('ChildrenService', () => {
  let service: ChildrenService;
  let mockDb: any;

  const mockChildren: Child[] = [
    { id: 1, groupId: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, groupId: 1, firstName: 'Jane', lastName: 'Smith' },
  ];

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockChildren),
        }),
      }),
    };

    (database as any).db = mockDb;

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
      mockDb.select().from().where.mockResolvedValueOnce([]);

      const result = await service.findByGroup(99);

      expect(result).toEqual([]);
    });
  });
});
