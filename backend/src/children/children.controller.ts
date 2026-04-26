import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Child } from 'database/schema';
import { User } from 'database/schema';
import { ChildWithGroup } from './children.service';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @Roles('PARENT')
  async findMine(
    @Req() req: Request & { user?: User }
  ): Promise<ChildWithGroup[]> {
    return this.childrenService.findForParent(req.user!.id);
  }

  @Get('group/:id')
  @Roles('TEACHER')
  async findByGroup(@Param('id', ParseIntPipe) id: number): Promise<Child[]> {
    return this.childrenService.findByGroup(id);
  }
}
