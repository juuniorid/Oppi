import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewPost } from 'database/schema';

export class CreatePostDto implements Omit<NewPost, 'id' | 'createdAt' | 'userId'> {
  @ApiProperty({
    example: 'Trip to the park',
    description: 'Title of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'We will be going to the park on Friday.',
    description: 'Full content of the announcement',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the group this post belongs to',
  })
  @IsInt()
  @Min(1)
  groupId!: number;


  constructor(title: string, message: string, groupId: number) {
    this.title = title;
    this.message = message;
    this.groupId = groupId;
  }
}
