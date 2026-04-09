import { Module } from '@nestjs/common';
import { AbsencesModule } from '../absences/absences.module';
import { PostsModule } from '../posts/posts.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PostsModule, AbsencesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
