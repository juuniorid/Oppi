import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ABSENCE_ENUM, ROLE, type Absence, type User } from 'database/schema';
import { AbsencesController } from 'src/absences/absences.controller';
import { AbsencesService } from 'src/absences/absences.service';
import { CreateAbsencesDto } from '../../src/common/dto/create-attendance.dto';

describe('AbsencesController', () => {
  let controller: AbsencesController;
  let absencesService: AbsencesService;

  const mockAttendance: Absence[] = [
    {
      id: 1,
      childId: 10,
      userId: 3,
      date: new Date('2026-03-10'),
      status: ABSENCE_ENUM.Absent,
      note: 'Sick',
      createdAt: new Date('2026-03-10T08:00:00.000Z'),
      deletedAt: null,
      updatedAt: new Date('2026-03-10T08:00:00.000Z'),
    },
  ];

  const mockUser: User = {
    id: 3,
    email: 'parent@example.com',
    firstName: 'Test Parent',
    lastName: 'Piip',
    googleId: 'google-parent',
    role: ROLE.Parent,
    phone: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AbsencesController],
      providers: [
        {
          provide: AbsencesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAttendance),
            findByGroupAndDateRange: jest.fn().mockResolvedValue(mockAttendance),
            findByChildAndDateRange: jest.fn().mockResolvedValue(mockAttendance),
          },
        },
      ],
    }).compile();

    controller = module.get<AbsencesController>(AbsencesController);
    absencesService = module.get<AbsencesService>(AbsencesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate attendance creation to the service', async () => {
      const createAttendanceDto = new CreateAbsencesDto({
        childId: 10,
        from: '2026-03-10',
        to: '2026-03-12',
        status: ABSENCE_ENUM.Absent,
        note: 'Sick',
      });
      const request = { user: mockUser } as Request & { user?: User };

      const result = await controller.create(createAttendanceDto, request);

      expect(absencesService.create).toHaveBeenCalledWith(createAttendanceDto, mockUser);
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('findByGroupAndDateRange', () => {
    it('should delegate group attendance range lookup to the service', async () => {
      const result = await controller.findByGroupAndDateRange(5, '2026-03-01', '2026-03-31');

      expect(absencesService.findByGroupAndDateRange).toHaveBeenCalledWith(
        5,
        '2026-03-01',
        '2026-03-31',
      );
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('findByChildAndDateRange', () => {
    it('should delegate child attendance range lookup to the service', async () => {
      const request = { user: mockUser } as Request & { user?: User };

      const result = await controller.findByChildAndDateRange(
        10,
        '2026-03-01',
        '2026-03-31',
        request,
      );

      expect(absencesService.findByChildAndDateRange).toHaveBeenCalledWith(
        10,
        '2026-03-01',
        '2026-03-31',
        mockUser,
      );
      expect(result).toEqual(mockAttendance);
    });
  });
});
