import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenService } from '../../src/children/children.service';
import { createTestUser } from '../helpers/create-users';
import { createTestGroup } from '../helpers/create-groups';
import { createTestChild } from '../helpers/create-children';
import { createTestEnrollment } from '../helpers/create-enrollments';
import { createTestUserChild } from '../helpers/create-user-children';
import { ROLE } from '../../src/database/schema';

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
      const emma = await createTestChild('Emma', 'Doe');
      const oliver = await createTestChild('Oliver', 'Smith');
      await createTestEnrollment(emma.id, group.id);
      await createTestEnrollment(oliver.id, group.id);

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
      await createTestUser('teacher@test.com', ROLE.Teacher);
      const ava = await createTestChild('Ava', 'Johnson');
      await createTestEnrollment(ava.id, group1.id);

      const result = await service.findByGroup(group2.id);

      expect(result).toEqual([]);
    });
  });

  describe('findByParent', () => {
    it('should return children linked to the parent with groupId', async () => {
      const parent = await createTestUser('parent@test.com', ROLE.Parent);
      const group = await createTestGroup('Sunflowers');
      const emma = await createTestChild('Emma', 'Doe');
      const oliver = await createTestChild('Oliver', 'Smith');
      await createTestUserChild(parent.id, emma.id);
      await createTestUserChild(parent.id, oliver.id);
      await createTestEnrollment(emma.id, group.id);
      await createTestEnrollment(oliver.id, group.id);

      const result = await service.findByParent(parent.id);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.firstName).sort()).toEqual(['Emma', 'Oliver']);
      expect(result.every((c) => c.groupId === group.id)).toBe(true);
    });

    it('should return empty array when parent has no children', async () => {
      const parent = await createTestUser('empty-parent@test.com', ROLE.Parent);

      const result = await service.findByParent(parent.id);

      expect(result).toEqual([]);
    });

    it('should not return children linked to other parents', async () => {
      const parent1 = await createTestUser('parent1@test.com', ROLE.Parent);
      const parent2 = await createTestUser('parent2@test.com', ROLE.Parent);
      const group = await createTestGroup('Tulips');
      const emma = await createTestChild('Emma', 'Johnson');
      await createTestUserChild(parent1.id, emma.id);
      await createTestEnrollment(emma.id, group.id);

      const result = await service.findByParent(parent2.id);

      expect(result).toEqual([]);
    });
  });
});
