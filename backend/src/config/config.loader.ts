import * as fs from 'fs';
import * as path from 'path';

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
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

function loadConfig(): AppConfig {
  const configPath = path.join(process.cwd(), 'config.json');
  const configFile = fs.readFileSync(configPath, 'utf-8');
  const config: AppConfig = JSON.parse(configFile);

  // Override with environment variables
  config.app.port = parseInt(process.env.PORT || `${config.app.port}`, 10);
  config.app.nodeEnv = process.env.NODE_ENV || config.app.nodeEnv;
  config.app.frontendUrl = process.env.FRONTEND_URL || config.app.frontendUrl;

  config.jwt.secret = process.env.JWT_SECRET || config.jwt.secret;
  config.jwt.expiresIn = process.env.JWT_EXPIRES_IN || config.jwt.expiresIn;

  config.google.clientId = process.env.GOOGLE_CLIENT_ID || config.google.clientId;
  config.google.clientSecret = process.env.GOOGLE_CLIENT_SECRET || config.google.clientSecret;
  config.google.callbackUrl = process.env.GOOGLE_CALLBACK_URL || config.google.callbackUrl;

  config.database.url = process.env.DATABASE_URL || config.database.url;

  if (!config.database.url) {
    throw new Error('DATABASE_URL is required');
  }

  return config;
}

export const appConfig = loadConfig();
