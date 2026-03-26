import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from './posts.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from '../common/dto/create-post.dto';
import { UpdatePostDto } from '../common/dto/update-post.dto';
import { Post as PostEntity, User } from 'database/schema';

@ApiTags('posts')
@ApiCookieAuth('jwt')
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Create a new announcement (TEACHER only)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only TEACHER role can create posts.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async create(@Body() createPostDto: CreatePostDto, @Req() req: Request & { user?: User }): Promise<PostEntity[]> {
    return this.postsService.create(createPostDto, req.user!.id);
  }

  @Patch(':id')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Update an existing post (TEACHER/ADMIN only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body.' })
  @ApiResponse({ status: 403, description: 'Forbidden — only TEACHER or ADMIN role can update posts.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto);
  }

  @Get('group/:id')
  @ApiOperation({ summary: 'Get all posts for a group ordered by newest first' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Posts returned successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden — PARENT does not have a child in this group.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findByGroup(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: User },
  ): Promise<PostEntity[]> {
    return this.postsService.findByGroup(id, req.user!);
  }
}
