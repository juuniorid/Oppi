import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../src/posts/posts.service';
import { createTestUser } from '../helpers/create-users';
import { createTestGroup } from '../helpers/create-groups';

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
  });

  describe('findByGroup', () => {
    it('should return posts for a group ordered by createdAt desc', async () => {
      const group = await createTestGroup('Butterflies');
      const author = await createTestUser('teacher2@test.com', 'TEACHER');

      await service.create({ title: 'First', content: 'A', groupId: group.id }, author.id);
      await service.create({ title: 'Second', content: 'B', groupId: group.id }, author.id);

      const result = await service.findByGroup(group.id);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Second');
      expect(result[1].title).toBe('First');
    });

    it('should return empty array when group has no posts', async () => {
      const group = await createTestGroup('Empty Group');

      const result = await service.findByGroup(group.id);

      expect(result).toEqual([]);
    });

    it('should not return posts from other groups', async () => {
      const group1 = await createTestGroup('Group One');
      const group2 = await createTestGroup('Group Two');
      const author = await createTestUser('teacher3@test.com', 'TEACHER');

      await service.create({ title: 'In Group 1', content: 'X', groupId: group1.id }, author.id);

      const result = await service.findByGroup(group2.id);

      expect(result).toEqual([]);
    });
  });
});
