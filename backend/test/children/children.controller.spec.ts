import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from '../../src/children/children.controller';
import {
  ChildWithGroup,
  ChildrenService,
} from '../../src/children/children.service';
import { NotFoundException } from '@nestjs/common';

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let childrenService: ChildrenService;

  const mockChildrenWithGroup: ChildWithGroup[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2020-01-15'),
      notes: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupId: 5,
      groupName: 'Mesimummud',
    },
  ];

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
      groupId: 1,
      groupName: 'Lepatriinud',
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
      groupId: 1,
      groupName: 'Lepatriinud',
    },
  ];

  const mockCreatedChild: ChildWithGroup = {
    id: 3,
    firstName: 'Mia',
    lastName: 'Stone',
    dateOfBirth: new Date('2021-02-10'),
    notes: 'Allergy note',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    groupId: 7,
    groupName: 'Sipsikud',
  };

  const mockUngroupedChild: ChildWithGroup = {
    id: 4,
    firstName: 'No',
    lastName: 'Group',
    dateOfBirth: new Date('2021-03-05'),
    notes: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    groupId: null,
    groupName: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [
        {
          provide: ChildrenService,
          useValue: {
            findForParent: jest.fn().mockResolvedValue(mockChildrenWithGroup),
            findAll: jest.fn().mockResolvedValue(mockChildrenWithGroup),
            findByGroup: jest.fn().mockResolvedValue(mockChildren),
            create: jest.fn().mockResolvedValue(mockCreatedChild),
            update: jest.fn().mockResolvedValue(mockCreatedChild),
            delete: jest.fn().mockResolvedValue(undefined),
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

  describe('findMine', () => {
    it('should return children for the authenticated parent', async () => {
      const result = await controller.findMine({ user: { id: 99 } } as never);

      expect(childrenService.findForParent).toHaveBeenCalledWith(99);
      expect(result).toEqual(mockChildrenWithGroup);
    });
  });

  describe('findAll', () => {
    it('should return all children', async () => {
      const result = await controller.findAll();

      expect(childrenService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockChildrenWithGroup);
    });
  });

  describe('create', () => {
    it('should create a child', async () => {
      const payload = {
        firstName: 'Mia',
        lastName: 'Stone',
        groupId: 7,
        dateOfBirth: '2021-02-10',
        notes: 'Allergy note',
      };

      const result = await controller.create(payload);

      expect(childrenService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockCreatedChild);
    });

    it('should propagate NotFoundException when group does not exist', async () => {
      jest
        .spyOn(childrenService, 'create')
        .mockRejectedValue(new NotFoundException('Group 999 not found'));

      await expect(
        controller.create({
          firstName: 'Mia',
          lastName: 'Stone',
          groupId: 999,
          dateOfBirth: '2021-02-10',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a child without assigning a group', async () => {
      const payload = {
        firstName: 'No',
        lastName: 'Group',
        dateOfBirth: '2021-03-05',
      };
      jest
        .spyOn(childrenService, 'create')
        .mockResolvedValueOnce(mockUngroupedChild);

      const result = await controller.create(payload);

      expect(childrenService.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockUngroupedChild);
    });
  });

  describe('update', () => {
    it('should update a child', async () => {
      const payload = {
        firstName: 'Updated',
        groupId: 2,
      };

      const result = await controller.update(3, payload);

      expect(childrenService.update).toHaveBeenCalledWith(3, payload);
      expect(result).toEqual(mockCreatedChild);
    });

    it('should propagate NotFoundException when child does not exist', async () => {
      jest
        .spyOn(childrenService, 'update')
        .mockRejectedValue(new NotFoundException('Child 999 not found'));

      await expect(controller.update(999, { firstName: 'X' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a child', async () => {
      const result = await controller.delete(3);

      expect(childrenService.delete).toHaveBeenCalledWith(3);
      expect(result).toEqual({ success: true });
    });

    it('should propagate NotFoundException when child does not exist', async () => {
      jest
        .spyOn(childrenService, 'delete')
        .mockRejectedValue(new NotFoundException('Child 999 not found'));

      await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
