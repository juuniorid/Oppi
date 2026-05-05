import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { users, ROLE } from 'database/schema';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class ParentsService {
    async findAllParents() {
        const parentsList = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                phone: users.phone,
                role: users.role,
            })
            .from(users)
            .where(
                and(
                    eq(users.role, ROLE.Parent),
                    isNull(users.deletedAt)
                )
            );

        return parentsList;
    }
}