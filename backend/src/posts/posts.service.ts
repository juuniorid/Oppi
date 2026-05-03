import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { db } from 'database/db';
import {
  posts,
  groups,
  Post,
  NewPost,
  User,
  userChildren,
  enrollments,
} from 'database/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { UpdatePostDto } from '../common/dto/update-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  async create(
    createPostDto: Omit<NewPost, 'id' | 'createdAt' | 'userId'>,
    userId: number
  ): Promise<Post[]> {
    await this.assertGroupExists(createPostDto.groupId);
    this.logger.verbose(
      `Creating post in group ${createPostDto.groupId} by user ${userId}`
    );
    return db
      .insert(posts)
      .values({
        title: createPostDto.title,
        message: createPostDto.message,
        groupId: createPostDto.groupId,
        userId,
      })
      .returning();
  }

  async update(postId: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), isNull(posts.deletedAt)),
    });
    if (!existing) {
      throw new NotFoundException(`Post ${postId} not found`);
    }

    const updateData: Partial<NewPost> = {};

    if (updatePostDto.title !== undefined) {
      updateData.title = updatePostDto.title;
    }

    if (updatePostDto.content !== undefined) {
      updateData.message = updatePostDto.content;
    }

    const [updated] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();
    return updated;
  }

  async delete(postId: number): Promise<void> {
    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), isNull(posts.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundException(`Post ${postId} not found`);
    }

    await db
      .update(posts)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  }

  async findByGroup(groupId: number, user: User): Promise<Post[]> {
    await this.assertGroupExists(groupId);
    await this.assertUserCanAccessGroup(groupId, user);
    this.logger.verbose(`Fetching posts for group ${groupId}`);
    return db
      .select()
      .from(posts)
      .where(and(eq(posts.groupId, groupId), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt));
  }

  private async assertGroupExists(groupId: number): Promise<void> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
  }

  private async assertUserCanAccessGroup(
    groupId: number,
    user: User
  ): Promise<void> {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return;

    const link = await db
      .select()
      .from(userChildren)
      .innerJoin(enrollments, eq(userChildren.childId, enrollments.childId))
      .where(
        and(eq(userChildren.userId, user.id), eq(enrollments.groupId, groupId))
      )
      .limit(1);

    if (link.length === 0) {
      throw new ForbiddenException('You do not have access to this group');
    }
  }
}
