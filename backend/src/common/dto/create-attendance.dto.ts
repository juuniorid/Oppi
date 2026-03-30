import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ABSENCE_ENUM, AbsenceEnum } from 'database/schema';

export class CreateAbsencesDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the child for whom attendance is reported',
  })
  @IsInt()
  @Min(1)
  childId!: number;

  @ApiProperty({
    example: '2026-03-01',
    description: 'Start date (inclusive) in ISO format (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  from!: string;

  @ApiProperty({
    example: '2026-03-03',
    description: 'End date (inclusive) in ISO format (YYYY-MM-DD)',
  })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  to!: string;

  @ApiProperty({
    example: ABSENCE_ENUM.Absent,
    description: 'Attendance status for the reported date range',
    enum: Object.values(ABSENCE_ENUM),
  })
  @IsIn(Object.values(ABSENCE_ENUM))
  status!: AbsenceEnum;

  @ApiPropertyOptional({
    example: 'Sick leave',
    description: 'Optional note describing the absence',
  })
  @IsOptional()
  @IsString()
  note?: string;

  constructor(data: {
    childId: number;
    from: string;
    to: string;
    status: AbsenceEnum;
    note?: string;
  }) {
    this.childId = data.childId;
    this.from = data.from;
    this.to = data.to;
    this.status = data.status;
    this.note = data.note;
  }
}
