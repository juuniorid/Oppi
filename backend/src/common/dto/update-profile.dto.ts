import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'First name' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: '+3725551234', description: 'Phone number' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(40)
  phone?: string;
}
