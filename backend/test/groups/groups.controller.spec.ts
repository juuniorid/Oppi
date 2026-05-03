import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { ROLE, User } from '../../src/database/schema';
import { GroupsController } from '../../src/groups/groups.controller';
import {
  GroupsService,
  GroupWithDetails,
  TeacherUser,
} from '../../src/groups/groups.service';

function createRequestWithUser(user: Partial<User>): Request & { user: User } {
  return {
    user: {
      id: 1,
      role: ROLE.Admin,
      email: 'admin@test.com',
      firstName: null,
      lastName: null,
      phone: null,
      googleId: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...user,
    },
  } as Request & { user: User };
}

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: GroupsService;

  const mockTeacher: TeacherUser = {
    id: 10,
    firstName: 'Mari',
    lastName: 'Mets',
    email: 'mari@test.com',
  };

  const mockGroups: GroupWithDetails[] = [
    {
      id: 1,
      name: 'Ants',
      description: null,
      ageMin: null,
      ageMax: null,
      kindergartenName: 'Sunshine Kindergarten',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      childrenCount: 3,
      teachers: [
        { id: 10, firstName: 'Mari', lastName: 'Mets', role: 'GENERAL' },
      ],
    },
    {
      id: 2,
      name: 'Bumblebees',
      description: null,
      ageMin: '3',
      ageMax: '5',
      kindergartenName: 'Sunshine Kindergarten',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      childrenCount: 0,
      teachers: [],
    },
  ];

  const mockCreatedGroup: GroupWithDetails = {
    id: 3,
    name: 'Foxes',
    description: 'Fast and clever',
    ageMin: '4',
    ageMax: '6',
    kindergartenName: 'Forest Kindergarten',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    childrenCount: 0,
    teachers: [
      { id: 10, firstName: 'Mari', lastName: 'Mets', role: 'GENERAL' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockGroups),
            findTeachers: jest.fn().mockResolvedValue([mockTeacher]),
            create: jest.fn().mockResolvedValue(mockCreatedGroup),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockGroups[0], name: 'Updated Ants' }),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all groups with details', async () => {
      const req = createRequestWithUser({});
      const result = await controller.findAll(req);

      expect(groupsService.findAll).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(mockGroups);
    });
  });

  describe('findTeachers', () => {
    it('should return all available teachers', async () => {
      const result = await controller.findTeachers();

      expect(groupsService.findTeachers).toHaveBeenCalled();
      expect(result).toEqual([mockTeacher]);
    });
  });

  describe('create', () => {
    it('should create and return a group without teachers', async () => {
      const dto = {
        name: 'Foxes',
        description: 'Fast and clever',
        ageMin: '4',
        ageMax: '6',
        kindergartenName: 'Forest Kindergarten',
      };

      const result = await controller.create(dto);

      expect(groupsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCreatedGroup);
    });

    it('should create a group with assigned teachers', async () => {
      const dto = { name: 'Foxes', teacherIds: [10] };

      await controller.create(dto);

      expect(groupsService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate BadRequestException for invalid teacher IDs', async () => {
      (groupsService.create as jest.Mock).mockRejectedValue(
        new BadRequestException('User IDs are not valid teachers: 99')
      );

      await expect(
        controller.create({ name: 'Foxes', teacherIds: [99] })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update and return a group', async () => {
      const dto = { name: 'Updated Ants' };

      const result = await controller.update(1, dto);

      expect(groupsService.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated Ants');
    });

    it('should update teacher assignments', async () => {
      const dto = { teacherIds: [10] };

      await controller.update(1, dto);

      expect(groupsService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should remove all teachers when teacherIds is empty array', async () => {
      const dto = { teacherIds: [] };

      await controller.update(1, dto);

      expect(groupsService.update).toHaveBeenCalledWith(1, dto);
    });

    it('should propagate NotFoundException from service', async () => {
      (groupsService.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Group with id 99999 not found')
      );

      await expect(controller.update(99999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should propagate BadRequestException for invalid teacher IDs', async () => {
      (groupsService.update as jest.Mock).mockRejectedValue(
        new BadRequestException('User IDs are not valid teachers: 99')
      );

      await expect(controller.update(1, { teacherIds: [99] })).rejects.toThrow(
        BadRequestException
      );
    });
  });
});

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: GroupsService;

  const mockGroups: GroupWithDetails[] = [
    {
      id: 1,
      name: 'Ants',
      description: null,
      ageMin: null,
      ageMax: null,
      kindergartenName: 'Sunshine Kindergarten',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      childrenCount: 3,
      teachers: [
        { id: 10, firstName: 'Mari', lastName: 'Mets', role: 'GENERAL' },
      ],
    },
    {
      id: 2,
      name: 'Bumblebees',
      description: null,
      ageMin: '3',
      ageMax: '5',
      kindergartenName: 'Sunshine Kindergarten',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      childrenCount: 0,
      teachers: [],
    },
  ];

  const mockCreatedGroup: GroupWithDetails = {
    id: 3,
    name: 'Foxes',
    description: 'Fast and clever',
    ageMin: '4',
    ageMax: '6',
    kindergartenName: 'Forest Kindergarten',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    childrenCount: 0,
    teachers: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockGroups),
            create: jest.fn().mockResolvedValue(mockCreatedGroup),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockGroups[0], name: 'Updated Ants' }),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all groups with details', async () => {
      const req = createRequestWithUser({});
      const result = await controller.findAll(req);

      expect(groupsService.findAll).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(mockGroups);
    });
  });

  describe('create', () => {
    it('should create and return a group', async () => {
      const dto = {
        name: 'Foxes',
        description: 'Fast and clever',
        ageMin: '4',
        ageMax: '6',
        kindergartenName: 'Forest Kindergarten',
      };

      const result = await controller.create(dto);

      expect(groupsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCreatedGroup);
    });
  });

  describe('update', () => {
    it('should update and return a group', async () => {
      const dto = { name: 'Updated Ants' };

      const result = await controller.update(1, dto);

      expect(groupsService.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated Ants');
    });

    it('should propagate NotFoundException from service', async () => {
      (groupsService.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Group with id 99999 not found')
      );

      await expect(controller.update(99999, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
