import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Child, User } from 'database/schema';
import { ChildWithGroup } from './children.service';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get('group/:id')
  @Roles('TEACHER')
  async findByGroup(@Param('id', ParseIntPipe) id: number): Promise<Child[]> {
    return this.childrenService.findByGroup(id);
  }

  @Get()
  @Roles('PARENT')
  async findByParent(@Req() req: Request): Promise<ChildWithGroup[]> {
    const user = req.user as User;
    return this.childrenService.findByParent(user.id);
  }
}
