import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE, type User } from 'database/schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEventDto, UpdateEventDto } from '../common/dto/event.dto';
import { CalendarEventView, EventsService } from './events.service';

@ApiTags('events')
@ApiCookieAuth('jwt')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles(ROLE.Parent, ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Get events in date range' })
  @ApiQuery({ name: 'from', type: String, required: true })
  @ApiQuery({ name: 'to', type: String, required: true })
  async findByDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: Request & { user?: User },
  ): Promise<CalendarEventView[]> {
    return this.eventsService.findEventsByDateRange(from, to, req.user!);
  }

  @Get('child/:id')
  @Roles(ROLE.Parent, ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Get child group events in date range' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'from', type: String, required: true })
  @ApiQuery({ name: 'to', type: String, required: true })
  async findByChild(
    @Param('id', ParseIntPipe) childId: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() req: Request & { user?: User },
  ): Promise<CalendarEventView[]> {
    return this.eventsService.findEventsByChildAndDateRange(childId, from, to, req.user!);
  }

  @Post()
  @Roles(ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(
    @Body() dto: CreateEventDto,
    @Req() req: Request & { user?: User },
  ): Promise<CalendarEventView> {
    return this.eventsService.createEvent(dto, req.user!);
  }

  @Put(':id')
  @Roles(ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEventDto })
  async update(
    @Param('id', ParseIntPipe) eventId: number,
    @Body() dto: UpdateEventDto,
    @Req() req: Request & { user?: User },
  ): Promise<CalendarEventView> {
    return this.eventsService.updateEvent(eventId, dto, req.user!);
  }

  @Delete(':id')
  @Roles(ROLE.Teacher, ROLE.Admin)
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', type: Number })
  async remove(
    @Param('id', ParseIntPipe) eventId: number,
    @Req() req: Request & { user?: User },
  ): Promise<void> {
    return this.eventsService.deleteEvent(eventId, req.user!);
  }
}
