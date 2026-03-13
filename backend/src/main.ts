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
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.setGlobalPrefix('v1');

    app.enableCors({
      origin: [appConfig.app.frontendUrl, `http://localhost:${appConfig.app.port}`],
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Oppi API')
      .setDescription('The Oppi kindergarten platform API documentation')
      .setVersion('1.0')
      .addBearerAuth()
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
