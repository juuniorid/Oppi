import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ChildrenController } from '../../src/children/children.controller';
import { ChildrenService } from '../../src/children/children.service';
import { Child, User, ROLE } from 'database/schema';
import { ChildWithGroup } from '../../src/children/children.service';

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let childrenService: ChildrenService;

  const mockChildren: ChildWithGroup[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2020-01-15'),
      notes: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupId: 10,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('2020-03-20'),
      notes: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupId: 10,
    },
  ];

  const mockChildrenNoGroup: Child[] = mockChildren.map(({ groupId: _g, ...c }) => c);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [
        {
          provide: ChildrenService,
          useValue: {
            findByGroup: jest.fn().mockResolvedValue(mockChildrenNoGroup),
            findByParent: jest.fn().mockResolvedValue(mockChildren),
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
      expect(result).toEqual(mockChildrenNoGroup);
    });
  });

  describe('findByParent', () => {
    it('should return children for the authenticated parent', async () => {
      const mockReq = { user: { id: 4, role: ROLE.Parent } as User } as unknown as Request;

      const result = await controller.findByParent(mockReq);

      expect(childrenService.findByParent).toHaveBeenCalledWith(4);
      expect(result).toEqual(mockChildren);
    });
  });
});
