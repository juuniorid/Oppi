import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { Logger } from 'nestjs-pino';
import { appConfig } from './config';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule, { logger: false });
    app.useLogger(app.get(Logger));
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || appConfig.app.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      optionsSuccessStatus: 204,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.setGlobalPrefix('v1');

    const config = new DocumentBuilder()
      .setTitle('Oppi API')
      .setDescription('The Oppi kindergarten platform API documentation')
      .setVersion('1.0')
      .addCookieAuth('jwt')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(appConfig.app.port);
  } catch (error) {
    console.error('❌ Failed to start application:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
