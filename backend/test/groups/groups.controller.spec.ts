import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from '../../src/groups/groups.controller';
import { GroupsService } from '../../src/groups/groups.service';
import { Group } from 'database/schema';

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: GroupsService;

  const mockGroups: Group[] = [
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
    },
    {
      id: 2,
      name: 'Bumblebees',
      description: null,
      ageMin: null,
      ageMax: null,
      kindergartenName: 'Sunshine Kindergarten',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockGroups),
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
    it('should return all groups', async () => {
      const result = await controller.findAll();

      expect(groupsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockGroups);
    });
  });
});
