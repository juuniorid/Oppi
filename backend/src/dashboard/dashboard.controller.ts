import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type User } from 'database/schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DashboardFeedItemDto } from '../common/dto/dashboard-feed-item.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiCookieAuth('jwt')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('feed')
  @Roles('PARENT')
  @ApiOperation({ summary: 'Get parent dashboard feed items' })
  @ApiQuery({
    name: 'from',
    type: String,
    required: true,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'to',
    type: String,
    required: true,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'childId',
    type: Number,
    required: false,
    description: 'Optional child id when parent has multiple children',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard feed returned successfully.',
    type: DashboardFeedItemDto,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query params or child selection.',
  })
  @ApiResponse({
    status: 404,
    description: 'No enrolled child found for current parent.',
  })
  async getFeed(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('childId', new ParseIntPipe({ optional: true }))
    childId: number | undefined,
    @Req() req: Request & { user?: User }
  ): Promise<DashboardFeedItemDto[]> {
    return this.dashboardService.getFeed(req.user!, from, to, childId);
  }
}
