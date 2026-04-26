import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Mari',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Tamm',
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({
    example: '+37251234567',
    description: 'Phone number in international format',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[+0-9()\-\s]*$/, {
    message: 'Phone can only include digits, spaces, +, parentheses and dashes',
  })
  phone?: string;
}
