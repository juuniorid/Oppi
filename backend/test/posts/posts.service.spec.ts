import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../src/posts/posts.service';
import * as database from 'database/db';
import { Post } from 'database/schema';

jest.mock('database/db');

describe('PostsService', () => {
  let service: PostsService;
  let mockDb: { insert: jest.Mock; select: jest.Mock };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'This is a test post',
    groupId: 1,
    authorId: 1,
    createdAt: new Date(),
  };

  const mockPosts: Post[] = [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Content 1',
      groupId: 1,
      authorId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Content 2',
      groupId: 1,
      authorId: 2,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockPost]),
        }),
      }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockPosts),
        }),
      }),
    };

    (database as unknown as { db: { insert: jest.Mock; select: jest.Mock } }).db = mockDb;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post with the provided data', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'This is a test post',
        groupId: 1,
      };
      const authorId = 1;

      const result = await service.create(createPostDto, authorId);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findByGroup', () => {
    it('should return posts for a specific group', async () => {
      const result = await service.findByGroup(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array when no posts found', async () => {
      mockDb.select().from().where.mockResolvedValueOnce([]);

      const result = await service.findByGroup(99);

      expect(result).toEqual([]);
    });
  });
});
