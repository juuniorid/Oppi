import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Ants', description: 'Group name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Friendly ant group', description: 'Group description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: '3', description: 'Minimum age for the group' })
  @IsOptional()
  @IsString()
  ageMin?: string;

  @ApiPropertyOptional({ example: '5', description: 'Maximum age for the group' })
  @IsOptional()
  @IsString()
  ageMax?: string;

  @ApiPropertyOptional({ example: 'Sunshine Kindergarten', description: 'Kindergarten name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kindergartenName?: string;

  @ApiPropertyOptional({ example: [1, 2], description: 'IDs of teachers to assign to the group' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  teacherIds?: number[];
}
