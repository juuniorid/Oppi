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
import { Request } from 'express';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE, User } from 'database/schema';
import { ChildWithGroup } from './children.service';
import { CreateChildDto } from '../common/dto/create-child.dto';
import { UpdateChildDto } from '../common/dto/update-child.dto';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get('my')
  @Roles(ROLE.Parent)
  async findMine(
    @Req() req: Request & { user?: User }
  ): Promise<ChildWithGroup[]> {
    return this.childrenService.findForParent(req.user!.id);
  }

  @Get('')
  @Roles(ROLE.Admin)
  async findAll(): Promise<ChildWithGroup[]> {
    return this.childrenService.findAll();
  }

  @Get('group/:id')
  @Roles(ROLE.Teacher, ROLE.Admin)
  async findByGroup(@Param('id', ParseIntPipe) id: number): Promise<ChildWithGroup[]> {
    return this.childrenService.findByGroup(id);
  }

  @Post()
  @Roles(ROLE.Admin)
  async create(@Body() createChildDto: CreateChildDto): Promise<ChildWithGroup> {
    return this.childrenService.create(createChildDto);
  }

  @Patch(':id')
  @Roles(ROLE.Admin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: UpdateChildDto,
  ): Promise<ChildWithGroup> {
    return this.childrenService.update(id, updateChildDto);
  }

  @Delete(':id')
  @Roles(ROLE.Admin)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    await this.childrenService.delete(id);
    return { success: true };
  }
}
