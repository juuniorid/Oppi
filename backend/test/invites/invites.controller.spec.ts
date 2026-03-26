import { Test, TestingModule } from '@nestjs/testing';
import { InvitesController } from '../../src/invites/invites.controller';
import { InvitesService } from '../../src/invites/invites.service';
import { User } from 'database/schema';
import { ConflictException } from '@nestjs/common';

describe('InvitesController', () => {
  let controller: InvitesController;
  let invitesService: InvitesService;

  const mockInvitedUser: User = {
    id: 10,
    email: 'newteacher@example.com',
    name: 'newteacher@example.com',
    googleId: null,
    role: 'TEACHER',
    phone: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [
        {
          provide: InvitesService,
          useValue: {
            createInvite: jest.fn().mockResolvedValue(mockInvitedUser),
          },
        },
      ],
    }).compile();

    controller = module.get<InvitesController>(InvitesController);
    invitesService = module.get<InvitesService>(InvitesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an invitation and return the user', async () => {
      const dto = { email: 'newteacher@example.com', role: 'TEACHER' as const };

      const result = await controller.create(dto);

      expect(invitesService.createInvite).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockInvitedUser);
    });

    it('should propagate ConflictException for duplicate emails', async () => {
      const dto = { email: 'existing@example.com', role: 'PARENT' as const };
      jest
        .spyOn(invitesService, 'createInvite')
        .mockRejectedValueOnce(new ConflictException('A user with this email has already been invited or registered.'));

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
