import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Child } from 'database/schema';

@Controller('children')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get('group/:id')
  @Roles('TEACHER')
  async findByGroup(@Param('id') id: string): Promise<Child[]> {
    return this.childrenService.findByGroup(+id);
  }
}  
