import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE } from 'database/schema';
import { GroupsService, GroupWithDetails, TeacherUser } from './groups.service';
import { CreateGroupDto } from '../common/dto/create-group.dto';
import { UpdateGroupDto } from '../common/dto/update-group.dto';

@ApiTags('groups')
@ApiCookieAuth('jwt')
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @Roles(ROLE.Admin, ROLE.Teacher)
  @ApiOperation({ summary: 'Get all groups with children count and assigned teachers (ADMIN/TEACHER only)' })
  @ApiResponse({ status: 200, description: 'Groups returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN or TEACHER role can list groups.' })
  async findAll(): Promise<GroupWithDetails[]> {
    return this.groupsService.findAll();
  }

  @Get('teachers')
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Get all users with TEACHER role available for group assignment (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Teachers returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can access this endpoint.' })
  async findTeachers(): Promise<TeacherUser[]> {
    return this.groupsService.findTeachers();
  }

  @Post()
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Create a new group (ADMIN only)' })
  @ApiBody({ type: CreateGroupDto })
  @ApiResponse({ status: 201, description: 'Group created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body or invalid teacher IDs.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can create groups.' })
  async create(@Body() createGroupDto: CreateGroupDto): Promise<GroupWithDetails> {
    return this.groupsService.create(createGroupDto);
  }

  @Patch(':id')
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Update an existing group (ADMIN only). Provide teacherIds to fully replace teacher assignments; omit to leave unchanged.' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiResponse({ status: 200, description: 'Group updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body or invalid teacher IDs.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can update groups.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupWithDetails> {
    return this.groupsService.update(id, updateGroupDto);
  }
}
