import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from '../../src/children/children.controller';
import { ChildrenService } from '../../src/children/children.service';
import { Child } from 'database/schema';

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let childrenService: ChildrenService;
  const createdAt = new Date('2026-03-01T08:00:00.000Z');
  const updatedAt = new Date('2026-03-01T08:00:00.000Z');

  const mockChildren: Child[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2020-01-15'),
      notes: null,
      deletedAt: null,
      createdAt,
      updatedAt,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('2020-03-20'),
      notes: null,
      deletedAt: null,
      createdAt,
      updatedAt,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [
        {
          provide: ChildrenService,
          useValue: {
            findByGroup: jest.fn().mockResolvedValue(mockChildren),
          },
        },
      ],
    }).compile();

    controller = module.get<ChildrenController>(ChildrenController);
    childrenService = module.get<ChildrenService>(ChildrenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByGroup', () => {
    it('should return children for a specific group', async () => {
      const result = await controller.findByGroup(1);

      expect(childrenService.findByGroup).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockChildren);
    });
  });
});
