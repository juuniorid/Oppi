import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { Logger } from 'nestjs-pino';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule, { logger: false });
    app.useLogger(app.get(Logger));
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.enableCors({
      origin: appConfig.app.frontendUrl,
      credentials: true,
    });
    await app.listen(appConfig.app.port);
  } catch (error) {
    console.error('❌ Failed to start application:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Unhandled error in bootstrap:');
  console.error(err);
  process.exit(1);
});
