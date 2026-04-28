import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE, User } from 'database/schema';
import { ChildWithGroup } from './children.service';
import { CreateChildDto } from '../common/dto/create-child.dto';
import { UpdateChildDto } from '../common/dto/update-child.dto';

@ApiTags('children')
@ApiCookieAuth('jwt')
@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get('my')
  @Roles(ROLE.Parent)
  @ApiOperation({ summary: "Get the current parent's children with their enrolled group (PARENT only)" })
  @ApiResponse({ status: 200, description: 'Children returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only PARENT role can access this endpoint.' })
  async findMine(
    @Req() req: Request & { user?: User }
  ): Promise<ChildWithGroup[]> {
    return this.childrenService.findForParent(req.user!.id);
  }

  @Get('')
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Get all children with their enrolled group (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Children returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can list all children.' })
  async findAll(): Promise<ChildWithGroup[]> {
    return this.childrenService.findAll();
  }

  @Get('group/:id')
  @Roles(ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Get children enrolled in a specific group (TEACHER/ADMIN only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Children returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only TEACHER or ADMIN role can access this endpoint.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findByGroup(@Param('id', ParseIntPipe) id: number): Promise<ChildWithGroup[]> {
    return this.childrenService.findByGroup(id);
  }

  @Post()
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Create a new child and optionally enroll them in a group (ADMIN only)' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 201, description: 'Child created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can create children.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async create(@Body() createChildDto: CreateChildDto): Promise<ChildWithGroup> {
    return this.childrenService.create(createChildDto);
  }

  @Patch(':id')
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Update a child record and/or their group enrollment (ADMIN only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Child ID' })
  @ApiBody({ type: UpdateChildDto })
  @ApiResponse({ status: 200, description: 'Child updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can update children.' })
  @ApiResponse({ status: 404, description: 'Child or group not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: UpdateChildDto,
  ): Promise<ChildWithGroup> {
    return this.childrenService.update(id, updateChildDto);
  }

  @Delete(':id')
  @Roles(ROLE.Admin)
  @ApiOperation({ summary: 'Soft-delete a child record (ADMIN only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Child ID' })
  @ApiResponse({ status: 200, description: 'Child deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only ADMIN role can delete children.' })
  @ApiResponse({ status: 404, description: 'Child not found.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    await this.childrenService.delete(id);
    return { success: true };
  }
}
