import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ChildrenModule } from './children/children.module';
import { GroupsModule } from './groups/groups.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? {
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
    MessagesModule,
    UsersModule,
  ],
})
export class AppModule {}
