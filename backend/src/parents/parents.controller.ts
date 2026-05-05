import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { ParentDto } from '../common/dto/parents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE } from 'database/schema';

@ApiTags('parents')
@ApiCookieAuth('jwt')
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
    constructor(private readonly parentsService: ParentsService) {}

    @Get()
    @Roles(ROLE.Admin, ROLE.Teacher)
    @ApiOperation({ summary: 'Get all parent users (ADMIN/TEACHER only)' })
    @ApiResponse({
        status: 200,
        description: 'List of parents returned successfully.',
        type: [ParentDto],
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden — only ADMIN or TEACHER can access this.',
    })
    async getAllParents(): Promise<ParentDto[]> {
        return this.parentsService.findAllParents();
    }
}