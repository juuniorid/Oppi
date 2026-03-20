import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../../src/posts/posts.controller';
import { PostsService } from '../../src/posts/posts.service';
import { Post, User } from 'database/schema';
import { Request } from 'express';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  const mockPost: Post = {
    id: 1,
    groupId: 1,
    createdByUserId: 1,
    title: 'Test title',
    message: 'This is a test post',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPosts: Post[] = [
    {
      id: 1,
      groupId: 1,
      createdByUserId: 1,
      title: 'Title 1',
      message: 'Content 1',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      groupId: 1,
      createdByUserId: 2,
      title: 'Title 2',
      message: 'Content 2',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUser: User = {
    id: 1,
    email: 'teacher@example.com',
    firstName: 'Test',
    lastName: 'Teacher',
    googleId: 'google_123',
    role: 'TEACHER',
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
        groupId: 1,
        title: 'Test title',
        message: 'This is a test post',
      };
      const mockRequest = { user: mockUser } as Request & { user?: User };

      const result = await controller.create(createPostDto, mockRequest);

      expect(postsService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser.id
      );
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
