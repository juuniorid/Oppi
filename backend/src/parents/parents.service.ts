import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { users, ROLE, groupUsers, enrollments, userChildren } from 'database/schema';
import { and, eq, isNull, inArray } from 'drizzle-orm';
import { ParentDto } from '../common/dto/parents.dto';

@Injectable()
export class ParentsService {
    async findAllParents(requestingUserId: number, role: string): Promise<ParentDto[]> {
        // 1. Kui on ADMIN, näitame kõiki (nagu varem)
        if (role === 'ADMIN') {
            return db
                .select({
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    phone: users.phone,
                    role: users.role,
                })
                .from(users)
                .where(and(eq(users.role, 'PARENT'), isNull(users.deletedAt)));
        }

        const teacherGroups = db
            .select({ groupId: groupUsers.groupId })
            .from(groupUsers)
            .where(eq(groupUsers.userId, requestingUserId));

        const childrenInGroups = db
            .select({ childId: enrollments.childId })
            .from(enrollments)
            .where(inArray(enrollments.groupId, teacherGroups));

        // Siin kasutame nüüd õiget tabeli nime: userChildren
        const parentIds = db
            .select({ userId: userChildren.userId })
            .from(userChildren)
            .where(inArray(userChildren.childId, childrenInGroups));

        return db
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
                    eq(users.role, 'PARENT'),
                    isNull(users.deletedAt),
                    inArray(users.id, parentIds)
                )
            );
    }
}