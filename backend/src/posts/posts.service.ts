import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { posts, Post, NewPost } from 'database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class PostsService {
  async create(createPostDto: Omit<NewPost, 'id' | 'createdAt' | 'authorId'>, authorId: number): Promise<Post[]> {
    return db.insert(posts).values({
      title: createPostDto.title,
      content: createPostDto.content,
      groupId: createPostDto.groupId,
      authorId,
    }).returning();
  }

  async findByGroup(groupId: number): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.groupId, groupId)).orderBy(desc(posts.createdAt));
  }
}
