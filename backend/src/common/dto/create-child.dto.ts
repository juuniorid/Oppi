import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ example: 'Maia', description: 'Child first name' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Saia', description: 'Child last name' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 1, description: 'Optional active group id for the child' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  groupId?: number;

  @ApiProperty({ example: '2020-03-14', description: 'Date of birth in YYYY-MM-DD format' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiPropertyOptional({ example: 'Peanut allergy', description: 'Optional notes' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;
}