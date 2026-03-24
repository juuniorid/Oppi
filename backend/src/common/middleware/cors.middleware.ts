import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';
import { appConfig } from 'src/config';

@Injectable()
export class CorsMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    res.header('Access-Control-Allow-Origin', appConfig.app.frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }
}
