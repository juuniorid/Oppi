import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../../src/posts/posts.controller';
import { PostsService } from '../../src/posts/posts.service';
import { Post, User } from 'database/schema';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

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

  const mockUser: User = {
    id: 1,
    email: 'teacher@example.com',
    name: 'Test Teacher',
    googleId: 'google_123',
    role: 'TEACHER',
    phone: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn().mockResolvedValue([mockPost]),
            findByGroup: jest.fn().mockResolvedValue(mockPosts),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'This is a test post',
        groupId: 1,
      };
      const mockRequest = { user: mockUser } as any;

      const result = await controller.create(createPostDto, mockRequest);

      expect(postsService.create).toHaveBeenCalledWith(createPostDto, mockUser.id);
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findByGroup', () => {
    it('should return posts for a specific group', async () => {
      const result = await controller.findByGroup('1');

      expect(postsService.findByGroup).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPosts);
    });
  });
});
