import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { Group, groups } from 'database/schema';
import { asc, getTableColumns } from 'drizzle-orm';

@Injectable()
export class GroupsService {
  async findAll(): Promise<Group[]> {
    return db
      .select(getTableColumns(groups))
      .from(groups)
      .orderBy(asc(groups.name));
  }
}
