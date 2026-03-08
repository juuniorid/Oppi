import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from './posts.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from '../common/dto/create-post.dto';
import { Post as PostEntity, User } from 'database/schema';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles('TEACHER')
  async create(@Body() createPostDto: CreatePostDto, @Req() req: Request & { user?: User }): Promise<PostEntity[]> {
    return this.postsService.create(createPostDto, req.user!.id);
  }

  @Get('group/:id')
  async findByGroup(@Param('id') id: string): Promise<PostEntity[]> {    
    return this.postsService.findByGroup(+id);
  }
}
