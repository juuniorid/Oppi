import { NewPost } from 'database/schema';

export class CreatePostDto implements Omit<
  NewPost,
  'id' | 'createdAt' | 'updatedAt' | 'createdByUserId' | 'deletedAt'
> {
  groupId: number;
  title: string;
  message: string;

  constructor(groupId: number, title: string, message: string) {
    this.groupId = groupId;
    this.title = title;
    this.message = message;
  }
}
