import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ChildrenModule } from './children/children.module';
import { GroupsModule } from './groups/groups.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './mail/mailer.module';
import { InvitesModule } from './invites/invites.module';
import { LoggerModule } from 'nestjs-pino';
import { appConfig } from './config';
import { AbsencesModule } from './absences/absences.module';
import { CorsMiddleware } from './common/middleware/cors.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '../.env.local'),
        path.resolve(process.cwd(), '../.env'),
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: appConfig.app.nodeEnv !== 'production' ? {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        } : undefined,
      },
    }),
    AuthModule,
    PostsModule,
    ChildrenModule,
    GroupsModule,
    NotificationsModule,
    ChatModule,
    UsersModule,
    AbsencesModule,
    MailerModule,
    InvitesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}

