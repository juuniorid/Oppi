import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../../src/children/children.service';
import { createTestUser } from '../helpers/create-users';
import { createTestGroup } from '../helpers/create-groups';
import { createTestChild } from '../helpers/create-children';

describe('ChildrenService (e2e)', () => {
  let service: ChildrenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildrenService],
    }).compile();

    service = module.get<ChildrenService>(ChildrenService);
  });

  describe('findByGroup', () => {
    it('should return children for a group', async () => {
      const group = await createTestGroup('Bumblebees');
      await createTestChild('Emma', 'Doe', group.id);
      await createTestChild('Oliver', 'Smith', group.id);

      const result = await service.findByGroup(group.id);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.firstName).sort()).toEqual(['Emma', 'Oliver']);
    });

    it('should return empty array when group has no children', async () => {
      const group = await createTestGroup('Empty Group');

      const result = await service.findByGroup(group.id);

      expect(result).toEqual([]);
    });

    it('should not return children from other groups', async () => {
      const group1 = await createTestGroup('Group One');
      const group2 = await createTestGroup('Group Two');
      await createTestUser('teacher@test.com', 'TEACHER');
      await createTestChild('Ava', 'Johnson', group1.id);

      const result = await service.findByGroup(group2.id);

      expect(result).toEqual([]);
    });
  });
});
