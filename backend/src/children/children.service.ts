import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { children, Child } from 'database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ChildrenService {
  async findByGroup(groupId: number): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.groupId, groupId));
  }
}
