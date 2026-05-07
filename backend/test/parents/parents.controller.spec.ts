import { Test, TestingModule } from '@nestjs/testing';
import { ParentsController } from '../../src/parents/parents.controller';
import { ParentsService } from '../../src/parents/parents.service';

describe('ParentsController', () => {
    let controller: ParentsController;

    const mockParents = [
        { id: 1, email: 'test@test.ee', firstName: 'Kalle', lastName: 'Kuusk', role: 'PARENT' }
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ParentsController],
            providers: [
                {
                    provide: ParentsService,
                    useValue: {
                        findAllParents: jest.fn().mockResolvedValue(mockParents),
                    },
                },
            ],
        }).compile();

        controller = module.get<ParentsController>(ParentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return parents list', async () => {
        // We pass a mock request object with the user role
        const mockReq = { user: { id: 1, role: 'ADMIN' } };
        const result = await controller.getAllParents(mockReq);
        expect(result).toEqual(mockParents);
    });
});