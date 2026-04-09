import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from 'database/db';
import {
  ABSENCE_ENUM,
  children,
  enrollments,
  type User,
  userChildren,
} from 'database/schema';
import { AbsencesService } from '../absences/absences.service';
import { PostsService } from '../posts/posts.service';
import { DashboardFeedItemDto } from '../common/dto/dashboard-feed-item.dto';

type ParentChildContext = {
  childId: number;
  groupId: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly postsService: PostsService,
    private readonly absencesService: AbsencesService
  ) {}

  async getFeed(
    user: User,
    from: string,
    to: string,
    childId?: number
  ): Promise<DashboardFeedItemDto[]> {
    const context = await this.resolveParentChildContext(user.id, childId);

    const [groupPosts, attendance] = await Promise.all([
      this.postsService.findByGroup(context.groupId, user),
      this.absencesService.findByChildAndDateRange(
        context.childId,
        from,
        to,
        user
      ),
    ]);

    const attendanceByDate = new Map(
      attendance.map((record) => [this.toDateKey(record.date), record.status])
    );

    return groupPosts
      .filter((post) => {
        const postDate = this.toDateKey(post.createdAt);
        return postDate >= from && postDate <= to;
      })
      .map((post) => {
        const postDate = this.toDateKey(post.createdAt);

        return {
          id: post.id,
          date: postDate,
          title: post.title,
          description: post.message,
          status: attendanceByDate.get(postDate) ?? ABSENCE_ENUM.Present,
        };
      });
  }

  private async resolveParentChildContext(
    userId: number,
    childId?: number
  ): Promise<ParentChildContext> {
    const links = await db
      .select({ childId: children.id, groupId: enrollments.groupId })
      .from(userChildren)
      .innerJoin(children, eq(children.id, userChildren.childId))
      .innerJoin(enrollments, eq(enrollments.childId, children.id))
      .where(
        and(
          eq(userChildren.userId, userId),
          isNull(children.deletedAt),
          isNull(enrollments.deletedAt),
          childId === undefined ? undefined : eq(children.id, childId)
        )
      );

    if (links.length === 0) {
      throw new NotFoundException(
        'No enrolled child found for the current parent'
      );
    }

    if (childId === undefined && links.length > 1) {
      throw new BadRequestException(
        'Multiple children found. Specify childId.'
      );
    }

    return links[0];
  }

  private toDateKey(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
