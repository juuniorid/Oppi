import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { posts, Post, NewPost } from 'database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PostsService {
  async create(
    createPostDto: Omit<
      NewPost,
      'id' | 'createdAt' | 'updatedAt' | 'createdByUserId'
    >,
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
    return await db.select().from(posts).where(eq(posts.groupId, groupId));
  }
}
