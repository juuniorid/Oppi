import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { CreatePostDto } from 'src/common/dto/create-post.dto';
import { posts, Post } from 'database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class PostsService {
  async create(
    createPostDto: CreatePostDto,
    authorId: number
  ): Promise<Post[]> {
    return db
      .insert(posts)
      .values({
        groupId: createPostDto.groupId,
        title: createPostDto.title,
        message: createPostDto.message,
        createdByUserId: authorId,
      })
      .returning();
  }

  async findByGroup(groupId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.groupId, groupId))
      .orderBy(desc(posts.createdAt));
  }
}
