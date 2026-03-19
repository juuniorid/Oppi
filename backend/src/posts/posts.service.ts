import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { db } from 'database/db';
import { posts, groups, children, parentsToChildren, Post, NewPost, User } from 'database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { UpdatePostDto } from '../common/dto/update-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  async create(createPostDto: Omit<NewPost, 'id' | 'createdAt' | 'authorId'>, authorId: number): Promise<Post[]> {
    await this.assertGroupExists(createPostDto.groupId);
    this.logger.verbose(`Creating post in group ${createPostDto.groupId} by user ${authorId}`);
    return db.insert(posts).values({
      title: createPostDto.title,
      content: createPostDto.content,
      groupId: createPostDto.groupId,
      authorId,
    }).returning();
  }

  async update(postId: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const existing = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
    if (!existing) {
      throw new NotFoundException(`Post ${postId} not found`);
    }
    const [updated] = await db
      .update(posts)
      .set({ ...updatePostDto })
      .where(eq(posts.id, postId))
      .returning();
    return updated;
  }

  async findByGroup(groupId: number, user: User): Promise<Post[]> {
    await this.assertGroupExists(groupId);
    await this.assertUserCanAccessGroup(groupId, user);
    this.logger.verbose(`Fetching posts for group ${groupId}`);
    return db.select().from(posts).where(eq(posts.groupId, groupId)).orderBy(desc(posts.createdAt));
  }

  private async assertGroupExists(groupId: number): Promise<void> {
    const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
  }

  private async assertUserCanAccessGroup(groupId: number, user: User): Promise<void> {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return;
    // PARENT: must have a child in this group
    const link = await db
      .select()
      .from(parentsToChildren)
      .innerJoin(children, eq(parentsToChildren.childId, children.id))
      .where(and(eq(parentsToChildren.parentId, user.id), eq(children.groupId, groupId)))
      .limit(1);
    if (link.length === 0) {
      throw new ForbiddenException('You do not have access to this group');
    }
  }
}
