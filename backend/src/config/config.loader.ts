import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root-level .env (one level above the backend/ directory)
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), quiet: true });

export interface AppConfig {
  app: {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  database: {
    url: string;
  };
}

function loadConfig(): AppConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return {
    app: {
      port: parseInt(process.env.PORT ?? '3001', 10),
      nodeEnv: process.env.NODE_ENV ?? 'development',
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '60m',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
    },
    database: {
      url: databaseUrl,
    },
  };
}

export const appConfig = loadConfig();
