import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from '../../src/posts/posts.service';
import { createTestUser } from '../helpers/create-users';
import { createTestGroup } from '../helpers/create-groups';
import { createTestChild } from '../helpers/create-children';
import { testDb } from '../helpers/test-db';
import { parentsToChildren } from '../../src/database/schema';

describe('PostsService (e2e)', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should insert and return a post', async () => {
      const group = await createTestGroup('Bumblebees');
      const author = await createTestUser('teacher@test.com', 'TEACHER');

      const result = await service.create(
        { title: 'Hello', content: 'World', groupId: group.id },
        author.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Hello');
      expect(result[0].authorId).toBe(author.id);
      expect(result[0].groupId).toBe(group.id);
    });

    it('should throw NotFoundException when group does not exist', async () => {
      const author = await createTestUser('teacher@test.com', 'TEACHER');

      await expect(
        service.create({ title: 'Test', content: 'Content', groupId: 99999 }, author.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update title and content of an existing post', async () => {
      const group = await createTestGroup('Sunflowers');
      const author = await createTestUser('teacher@test.com', 'TEACHER');
      const [created] = await service.create(
        { title: 'Original', content: 'Original content', groupId: group.id },
        author.id,
      );

      const result = await service.update(created.id, { title: 'Updated', content: 'New content' });

      expect(result.id).toBe(created.id);
      expect(result.title).toBe('Updated');
      expect(result.content).toBe('New content');
      expect(result.groupId).toBe(group.id);
    });

    it('should update only title when content is omitted', async () => {
      const group = await createTestGroup('Daisies');
      const author = await createTestUser('teacher@test.com', 'TEACHER');
      const [created] = await service.create(
        { title: 'Old title', content: 'Keep this', groupId: group.id },
        author.id,
      );

      const result = await service.update(created.id, { title: 'New title' });

      expect(result.title).toBe('New title');
      expect(result.content).toBe('Keep this');
    });

    it('should throw NotFoundException when post does not exist', async () => {
      await expect(service.update(99999, { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByGroup', () => {
    it('should return posts ordered by createdAt DESC for a TEACHER', async () => {
      const group = await createTestGroup('Butterflies');
      const teacher = await createTestUser('teacher@test.com', 'TEACHER');

      await service.create({ title: 'First', content: 'A', groupId: group.id }, teacher.id);
      await service.create({ title: 'Second', content: 'B', groupId: group.id }, teacher.id);

      const result = await service.findByGroup(group.id, teacher);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Second');
      expect(result[1].title).toBe('First');
    });

    it('should return posts for a PARENT who has a child in the group', async () => {
      const group = await createTestGroup('Tulips');
      const teacher = await createTestUser('teacher@test.com', 'TEACHER');
      const parent = await createTestUser('parent@test.com', 'PARENT');
      const child = await createTestChild('Ada', 'Lovelace', group.id);
      await testDb.insert(parentsToChildren).values({ parentId: parent.id, childId: child.id });

      await service.create({ title: 'Hello parents', content: 'Info', groupId: group.id }, teacher.id);

      const result = await service.findByGroup(group.id, parent);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Hello parents');
    });

    it('should throw ForbiddenException for a PARENT with no child in the group', async () => {
      const group = await createTestGroup('Roses');
      const parent = await createTestUser('parent@test.com', 'PARENT');

      await expect(service.findByGroup(group.id, parent)).rejects.toThrow(ForbiddenException);
    });

    it('should return empty array when group has no posts', async () => {
      const group = await createTestGroup('Empty Group');
      const teacher = await createTestUser('teacher@test.com', 'TEACHER');

      const result = await service.findByGroup(group.id, teacher);

      expect(result).toEqual([]);
    });

    it('should not return posts from other groups', async () => {
      const group1 = await createTestGroup('Group One');
      const group2 = await createTestGroup('Group Two');
      const teacher = await createTestUser('teacher@test.com', 'TEACHER');

      await service.create({ title: 'In Group 1', content: 'X', groupId: group1.id }, teacher.id);

      const result = await service.findByGroup(group2.id, teacher);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when group does not exist', async () => {
      const teacher = await createTestUser('teacher@test.com', 'TEACHER');

      await expect(service.findByGroup(99999, teacher)).rejects.toThrow(NotFoundException);
    });
  });
});
