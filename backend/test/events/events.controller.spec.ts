import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { User, ROLE } from '../../src/database/schema';
import { EventsController } from '../../src/events/events.controller';
import { EventsService } from '../../src/events/events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEvent = {
    id: 1,
    name: 'Spring Party',
    time: '10:00',
    description: 'Party in the yard',
    date: '2026-04-28',
    type: 'GROUP' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findEventsByDateRange: jest.fn().mockResolvedValue([mockEvent]),
            findEventsByChildAndDateRange: jest.fn().mockResolvedValue([mockEvent]),
            createEvent: jest.fn().mockResolvedValue(mockEvent),
            updateEvent: jest.fn().mockResolvedValue(mockEvent),
            deleteEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates an event', async () => {
    const dto = {
      groupId: 2,
      from: '2026-04-28',
      to: '2026-04-28',
      timeFrom: '10:00',
      timeTo: '11:00',
      name: 'Spring Party',
      description: 'Party in the yard',
      type: 'GROUP',
    };

    const req = {
      user: { id: 10, role: ROLE.Admin } as User,
    } as Request & { user?: User };
    const result = await controller.create(dto, req);

    expect(service.createEvent).toHaveBeenCalledWith(dto, req.user);
    expect(result).toEqual(mockEvent);
  });
});
