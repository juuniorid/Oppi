import { IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ example: 'teacher@example.com', description: 'Email address to invite' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ['TEACHER', 'PARENT'], description: 'Role to assign to the invited user' })
  @IsIn(['TEACHER', 'PARENT'])
  role!: 'TEACHER' | 'PARENT';
}
