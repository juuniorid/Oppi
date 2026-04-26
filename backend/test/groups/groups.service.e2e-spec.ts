import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from '../../src/groups/groups.service';
import { createTestGroup } from '../helpers/create-groups';

describe('GroupsService (e2e)', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should return an empty array when there are no groups', async () => {
    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  it('should return groups ordered by name ascending', async () => {
    await createTestGroup('Zebras');
    await createTestGroup('Ants');
    await createTestGroup('Bumblebees');

    const result = await service.findAll();

    expect(result.map((group) => group.name)).toEqual([
      'Ants',
      'Bumblebees',
      'Zebras',
    ]);
  });
});
