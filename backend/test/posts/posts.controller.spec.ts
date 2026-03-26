import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostsController } from '../../src/posts/posts.controller';
import { PostsService } from '../../src/posts/posts.service';
import { Post, User } from 'database/schema';
import { Request } from 'express';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'This is a test post',
    groupId: 1,
    userId: 1,
    createdAt: new Date(),
  };

  const mockPosts: Post[] = [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Content 1',
      groupId: 1,
      userId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Content 2',
      groupId: 1,
      userId: 2,
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
            update: jest.fn().mockResolvedValue({ ...mockPost, title: 'Updated' }),
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
      const mockRequest = { user: mockUser } as Request & { user?: User };

      const result = await controller.create(createPostDto, mockRequest);

      expect(postsService.create).toHaveBeenCalledWith(createPostDto, mockUser.id);
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findByGroup', () => {
    it('should return posts for a specific group', async () => {
      const mockRequest = { user: mockUser } as Request & { user?: User };

      const result = await controller.findByGroup(1, mockRequest);

      expect(postsService.findByGroup).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(mockPosts);
    });

    it('should propagate NotFoundException when group does not exist', async () => {
      jest.spyOn(postsService, 'findByGroup').mockRejectedValue(new NotFoundException('Group 999 not found'));
      const mockRequest = { user: mockUser } as Request & { user?: User };

      await expect(controller.findByGroup(999, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const result = await controller.update(1, { title: 'Updated' });

      expect(postsService.update).toHaveBeenCalledWith(1, { title: 'Updated' });
      expect(result).toEqual({ ...mockPost, title: 'Updated' });
    });

    it('should propagate NotFoundException when post does not exist', async () => {
      jest.spyOn(postsService, 'update').mockRejectedValue(new NotFoundException('Post 999 not found'));

      await expect(controller.update(999, { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('create — 404 propagation', () => {
    it('should propagate NotFoundException when group does not exist', async () => {
      jest.spyOn(postsService, 'create').mockRejectedValue(new NotFoundException('Group 999 not found'));
      const mockRequest = { user: mockUser } as Request & { user?: User };

      await expect(
        controller.create({ title: 'Test', content: 'Content', groupId: 999 }, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
