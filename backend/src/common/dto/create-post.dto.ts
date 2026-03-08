import { NewPost } from 'database/schema';

export class CreatePostDto implements Omit<NewPost, 'id' | 'createdAt' | 'authorId'> {
  title: string;
  content: string;
  groupId: number;

  constructor(title: string, content: string, groupId: number) {
    this.title = title;
    this.content = content;
    this.groupId = groupId;
  }
}
