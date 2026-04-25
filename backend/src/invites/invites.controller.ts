import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateInviteDto } from '../common/dto/create-invite.dto';
import { User } from 'database/schema';

@ApiTags('invites')
@Controller('invites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Invite a user to the platform (Admin only)' })
  @ApiResponse({ status: 201, description: 'User successfully invited and email sent.' })
  @ApiResponse({ status: 409, description: 'A user with this email already exists.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only admins can send invitations.' })
  async create(@Body() createInviteDto: CreateInviteDto): Promise<User> {
    return this.invitesService.createInvite(createInviteDto);
  }
}
