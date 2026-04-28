import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';
import { appConfig } from 'src/config';

@Injectable()
export class CorsMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestOrigin = req.headers.origin;
    const allowedOrigins = new Set(appConfig.app.corsOrigins);

    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Vary', 'Origin');
    } else if (!requestOrigin && appConfig.app.corsOrigins[0]) {
      res.header('Access-Control-Allow-Origin', appConfig.app.corsOrigins[0]);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.header(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers']?.toString() || 'Content-Type, Authorization',
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
        this.logger.warn(`Blocked CORS preflight from origin ${requestOrigin}`);
        res.sendStatus(403);
        return;
      }

      res.sendStatus(204);
    } else {
      next();
    }
  }
}
