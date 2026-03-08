# Oppi Backend

This repository contains the backend service for the Oppi kindergarten communication
platform. It is built with [NestJS](https://nestjs.com) and exposes a REST API for
the frontend.

## Tech Stack

- **Framework**: NestJS 10.4+ (controllers, services, modules)
- **Database**: PostgreSQL with [Drizzle ORM 0.45+](https://drizzle.team)
- **Database Migrations**: drizzle-kit 0.28.0+
- **Authentication**: Google OAuth 2.0 via `passport-google-oauth20` + JWT tokens in HttpOnly cookies
- **Configuration**: JSON config file (`config.json`) with environment variable overrides
- **Logging**: [nestjs-pino](https://www.npmjs.com/package/nestjs-pino) for structured logs (pino-pretty in dev, JSON in prod)
- **Testing**: Jest 29.7+ & Supertest
- **Containerization**: Docker with Node.js 20 Alpine
- **Package Manager**: pnpm
- **TypeScript**: 5.9+ with strict mode

## Quick Start with Docker

The easiest way to run the entire project (database, backend, and frontend):

```bash
# From project root
docker compose up --build
```

This automatically:
- Starts PostgreSQL database
- Runs database migrations with drizzle-kit
- Seeds the database with test data
- Builds the backend (Node 20)
- Starts the backend API on http://localhost:3001
- Starts the frontend on http://localhost:3000

## Local Development Setup

1. Ensure PostgreSQL is running locally and create the database:
   ```bash
   createdb oppi
   ```

2. Ensure `config.json` has valid credentials:
   ```bash
   # Check backend/config.json contains:
   # - jwt.secret: "dev-secret" (or any secure string)
   # - google.clientId: "dummy-client-id" (or real Google OAuth client ID)
   # - google.clientSecret: "dummy-client-secret" (or real secret)
   # - database.url: "postgresql://oppi:oppi@localhost:5432/oppi"
   ```

3. Install dependencies:
   ```bash
   cd backend
   pnpm install
   ```

4. Run migrations and seed the database:
   ```bash
   pnpm run db:migrate
   pnpm run db:seed
   ```

5. Start in development mode:
   ```bash
   pnpm run start:dev
   ```

**Important**: Always run commands from the `backend` directory, as the app expects `config.json` to be in the current working directory (`process.cwd()`).

The API will be available at http://localhost:3001

## Database Migrations

The project uses drizzle-kit 0.28+ for schema management:

```bash
# After modifying src/database/schema.ts, generate migrations
pnpm run db:generate

# Apply migrations to the database (uses drizzle-kit push)
pnpm run db:migrate

# Seed the database with test data
pnpm run db:seed
```

## Available Scripts

```bash
# Development
pnpm run start          # Start (production or development based on NODE_ENV)
pnpm run start:dev      # Start in watch mode with hot reload
pnpm run start:debug    # Start in debug mode
pnpm run start:prod     # Run production build (node dist/src/main)

# Build
pnpm run build          # Compile TypeScript to dist/src/

# Testing
pnpm run test           # Run unit tests
pnpm run test:all       # Run all tests with --passWithNoTests flag
pnpm run test:watch     # Run tests in watch mode
pnpm run test:cov       # Run tests with coverage
pnpm run test:debug     # Run tests in debug mode
pnpm run test:e2e       # Run end-to-end tests

# Linting
pnpm run lint           # Run ESLint
pnpm run format         # Format code with Prettier

# Database
pnpm run db:generate    # Generate migrations from schema changes
pnpm run db:migrate     # Apply migrations (drizzle-kit push)
pnpm run db:seed        # Seed database with test data
```

## Configuration

The app uses a dual configuration system:

1. **config.json** (primary): Located in `backend/config.json`
   - Contains default configuration for all environments
   - Committed to git with safe defaults

2. **Environment Variables** (override): 
   - Override config.json values via environment variables
   - Set in `.env` file (root) for Docker or local dev
   - Example: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `DATABASE_URL`

Configuration is loaded via `src/config/config.loader.ts` using `process.cwd()` to find `config.json`.

## API Endpoints

### Authentication
- `GET /auth/google` – Redirect to Google for OAuth authentication
- `GET /auth/google/callback` – OAuth callback (sets JWT cookie)
- `GET /auth/me` – Get current authenticated user

### Posts (Announcements)
- `POST /posts` – Create announcement (teacher only)
- `GET /posts/group/:id` – List posts for a group

### Children
- `GET /children/group/:id` – List children in a group (teacher only)

## Folder Structure

```
backend/
├── src/
│   ├── auth/               # Authentication (Google OAuth + JWT)
│   │   ├── google.strategy.ts
│   │   ├── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── database/           # Drizzle ORM, schema, migrations, seeds
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   └── seeds/seed.ts
│   ├── posts/              # Announcements module
│   ├── children/           # Child management
│   ├── groups/             # Group/Class management
│   ├── messages/           # Messaging system
│   ├── users/              # User management
│   ├── config/             # Configuration loader
│   │   ├── config.loader.ts
│   │   └── app.config.ts
│   ├── common/             # Shared utilities, DTOs, decorators
│   ├── app.module.ts       # Root NestJS module
│   └── main.ts             # Application entry point
├── test/                   # Jest tests
├── config.json             # Configuration file (with defaults)
├── drizzle.config.ts       # Drizzle Kit configuration
├── Dockerfile              # Docker image definition
├── entrypoint.sh           # Docker startup script
├── package.json
└── tsconfig.json
```

## Key Features

✅ Google OAuth 2.0 + JWT authentication  
✅ Role-based access control (RBAC)  
✅ Type-safe database with Drizzle ORM  
✅ Automated migrations and seeding  
✅ Structured logging with Pino  
✅ Comprehensive test suite (Jest)  
✅ Docker containerization  
✅ Config-driven with environment overrides  

## Troubleshooting

**App crashes on startup with "JwtStrategy requires a secret or key":**
- Ensure `config.json` has `jwt.secret` set to a non-empty string
- The secret is loaded from `config.json` via `appConfig.jwt.secret`

**App crashes with "OAuth2Strategy requires a clientID option":**
- Ensure `config.json` has `google.clientId` and `google.clientSecret` set
- For local dev without Google OAuth, use dummy values like "dummy-client-id"

**Cannot find module errors:**
- Run `pnpm install` to ensure all dependencies are installed
- Check that you're running commands from the `backend` directory

**Database connection errors:**
- Ensure PostgreSQL is running: `pg_isready`
- Check `config.json` has correct `database.url`
- Verify database exists: `psql -l | grep oppi`

**Port 3001 already in use:**
- Stop Docker: `docker compose down`
- Or kill process: `lsof -ti:3001 | xargs kill`

## Links

- [NestJS Documentation](https://nestjs.com/)
- [Drizzle ORM](https://drizzle.team/)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20)
- [nestjs-pino](https://www.npmjs.com/package/nestjs-pino)

