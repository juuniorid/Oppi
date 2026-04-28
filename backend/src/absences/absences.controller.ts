import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE, type Absence, type User } from 'database/schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateAbsencesDto } from '../common/dto/create-attendance.dto';
import { AbsencesService } from './absences.service';

@ApiTags('absences')
@ApiCookieAuth('jwt')
@Controller('absences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Post()
  @Roles(ROLE.Parent, ROLE.Teacher)
  @ApiOperation({
    summary: 'Report child absence with from-to date range (PARENT/TEACHER)',
  })
  @ApiResponse({ status: 201, description: 'Absence created' })
  @ApiResponse({ status: 400, description: 'Invalid payload or date range' })
  @ApiResponse({ status: 403, description: 'Parent does not own child or child/group mismatch' })
  @ApiResponse({ status: 404, description: 'Child or group not found' })
  async create(
    @Body() createAbsenceDto: CreateAbsencesDto,
    @Req() req: Request & { user?: User },
  ): Promise<Absence[]> {
    return this.absencesService.create(createAbsenceDto, req.user!);
  }

  @Get('group/:id')
  @Roles(ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Get absences for a group within a date range (teacher view)' })
  @ApiParam({ name: 'id', type: Number, description: 'Group id' })
  @ApiQuery({ name: 'from', type: String, required: true, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'to', type: String, required: true, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Absences returned' })
  @ApiResponse({ status: 400, description: 'Invalid group id or date' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async findByGroupAndDateRange(
    @Param('id', ParseIntPipe) groupId: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<Absence[]> {
    return this.absencesService.findByGroupAndDateRange(groupId, from, to);
  }

  @Get('child/:id')
  @Roles(ROLE.Teacher, ROLE.Parent)
  @ApiOperation({ summary: 'Get absences for a child within a date range' })
  @ApiParam({ name: 'id', type: Number, description: 'Child id' })
  @ApiQuery({ name: 'from', type: String, required: true, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'to', type: String, required: true, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Attendance returned' })
  @ApiResponse({ status: 400, description: 'Invalid child id or date range' })
  @ApiResponse({ status: 403, description: 'Parent does not own child or teacher is not in child group' })
  @ApiResponse({ status: 404, description: 'Child not found or not enrolled in any group' })
  async findByChildAndDateRange(
    @Param('id', ParseIntPipe) childId: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: Request & { user?: User },
  ): Promise<Absence[]> {
    return this.absencesService.findByChildAndDateRange(childId, from, to, req.user!);
  }
}
