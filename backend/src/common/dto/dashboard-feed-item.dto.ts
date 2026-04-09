import { ApiProperty } from '@nestjs/swagger';
import { ABSENCE_ENUM, type AbsenceEnum } from 'database/schema';

export class DashboardFeedItemDto {
  @ApiProperty({ example: 1, description: 'Post id used as the feed item id' })
  id!: number;

  @ApiProperty({
    example: '2026-04-05',
    description: 'Calendar date for the feed item',
  })
  date!: string;

  @ApiProperty({ example: 'Daily description - Bumblebees' })
  title!: string;

  @ApiProperty({
    example:
      'Today we played outside, practiced colors, and spent time in the reading corner.',
  })
  description!: string;

  @ApiProperty({
    enum: Object.values(ABSENCE_ENUM),
    example: ABSENCE_ENUM.Present,
  })
  status!: AbsenceEnum;
}
