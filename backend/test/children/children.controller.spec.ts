import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from '../../src/children/children.controller';
import { ChildrenService } from '../../src/children/children.service';
import { Child } from 'database/schema';

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let childrenService: ChildrenService;

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
      const result = await controller.findByGroup('1');

      expect(childrenService.findByGroup).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockChildren);
    });
  });
});
