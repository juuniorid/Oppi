import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated trip title', description: 'New title for the post' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content.', description: 'New content for the post' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
