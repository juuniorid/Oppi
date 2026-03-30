# Oppi Backend

This repository contains the backend service for the Oppi kindergarten communication
platform. It is built with [NestJS](https://nestjs.com) and exposes a REST API for
the frontend.

## Tech Stack

- **Framework**: NestJS 10.4+ (controllers, services, modules)
- **Database**: PostgreSQL with [Drizzle ORM 0.45+](https://drizzle.team)
- **Database Migrations**: drizzle-kit 0.28.0+
- **Authentication**: Google OAuth 2.0 via `passport-google-oauth20` + JWT tokens in HttpOnly cookies
- **Configuration**: Environment variables loaded from root `.env` via dotenv (no config file)
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

2. Ensure `.env` in the project root has valid credentials:
   ```bash
   # Required variables:
   DATABASE_URL=postgresql://oppi:oppi@localhost:5432/oppi
   JWT_SECRET=dev-secret
   GOOGLE_CLIENT_ID=dummy-client-id
   GOOGLE_CLIENT_SECRET=dummy-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/v1/auth/google/callback
   TEST_DATABASE_URL=postgresql://oppi:oppi@localhost:5433/oppi_test
   ```

3. Install dependencies:
   ```bash
   cd backend
   pnpm install
   ```

4. Run migrations and seed the database:
   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   pnpm run db:seed
   ```

5. Start in development mode:
   ```bash
   pnpm run start:dev
   ```

**Important**: Always run commands from the `backend` directory.

The API will be available at http://localhost:3001

## Database Migrations

The project uses drizzle-kit 0.28+ for schema management:

```bash
# After modifying src/database/schema.ts, generate migrations
pnpm run db:generate

# Generate migration files from schema changes
pnpm run db:generate

# Apply committed migrations to the database
pnpm run db:migrate

# Or push schema changes directly to your local DB without creating migration files
pnpm run db:push

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
pnpm run db:generate    # Generate SQL migration files from schema changes
pnpm run db:migrate     # Apply committed migrations
pnpm run db:push        # Update local DB directly without creating migration files
pnpm run db:seed        # Seed database with test data
```

# Testing

## Unit Tests

```bash
pnpm test          # Run unit tests
pnpm test:watch    # Watch mode
pnpm test:cov      # With coverage
```

## E2E Tests

E2E tests run against a real isolated Postgres instance (`db-test` on port 5433). They require `TEST_DATABASE_URL` to be set.

```bash
# Start the test database
docker compose up -d db-test

# Run e2e tests
pnpm test:e2e
```

The e2e setup automatically:
1. Runs migrations against the test DB
2. Clears all tables between each test (`afterEach`)
3. Closes connections cleanly

## Configuration

All configuration is loaded from environment variables. In local development, variables are read from the root `.env` file (one level above `backend/`) via dotenv.

Key variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | required |
| `TEST_DATABASE_URL` | Test Postgres connection string (e2e tests) | required for e2e |
| `JWT_SECRET` | JWT signing secret | `dev-secret` |
| `JWT_EXPIRES_IN` | JWT expiry | `60m` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `dummy-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:3001/v1/auth/google/callback` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `PORT` | API listen port | `3001` |

## API Endpoints

### Authentication
- `GET /v1/auth/google` – Redirect to Google for OAuth authentication
- `GET /v1/auth/google/callback` – OAuth callback (sets JWT cookie)
- `GET /v1/auth/me` – Get current authenticated user
- `GET /v1/auth/logout` – Clear JWT cookie

### Posts (Announcements)
- `POST /v1/posts` – Create announcement (teacher only)
- `GET /v1/posts/group/:id` – List posts for a group

### Children
- `GET /v1/children/group/:id` – List children in a group (teacher only)

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
│   ├── auth/               # Auth e2e specs
│   ├── posts/              # Posts e2e specs
│   ├── children/           # Children e2e specs
│   └── helpers/            # Shared test helpers (test-db, create-*, clear-database)
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
✅ E2E tests with real Postgres test DB  
✅ Docker containerization  
✅ Environment variable configuration via dotenv  

## Troubleshooting

**App crashes on startup with "JwtStrategy requires a secret or key":**
- Ensure `JWT_SECRET` is set in `.env`

**App crashes with "OAuth2Strategy requires a clientID option":**
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- For local dev without Google OAuth, use dummy values like `dummy-client-id`

**Cannot find module errors:**
- Run `pnpm install` to ensure all dependencies are installed
- Check that you're running commands from the `backend` directory

**Database connection errors:**
- Ensure PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` is correct
- Verify database exists: `psql -l | grep oppi`

**E2E tests fail with "TEST_DATABASE_URL must be set":**
- Ensure `TEST_DATABASE_URL` is set in `.env`
- Start the test database: `docker compose up -d db-test`

**Port 3001 already in use:**
- Stop Docker: `docker compose down`
- Or kill process: `lsof -ti:3001 | xargs kill`

## Links

- [NestJS Documentation](https://nestjs.com/)
- [Drizzle ORM](https://drizzle.team/)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20)
- [nestjs-pino](https://www.npmjs.com/package/nestjs-pino)
