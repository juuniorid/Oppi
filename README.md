# Oppi - Kindergarten Communication Platform

A full-stack application for communication between kindergarten teachers and parents.

## Prerequisites

- Node.js 20+ with pnpm (for local development)
- PostgreSQL 14+ (for local development)
- Docker & Docker Compose (recommended for full stack)
- Google OAuth 2.0 credentials

## Project Setup

### 1. Environment Setup

Copy `.env.example` to `.env` in the project root and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/v1/auth/google/callback
JWT_SECRET=your_secure_random_jwt_secret_here
DATABASE_URL=postgresql://oppi:oppi@localhost:5432/oppi
TEST_DATABASE_URL=postgresql://oppi:oppi@localhost:5433/oppi_test
```

### 2. Choose Your Setup

**OptioStart the Application

**Option A: Docker (Recommended - Fully Automated)**

All services (database, backend API, frontend) run in Docker with automated migrations and seeding:

```bash
docker compose up --build
```

This automatically:
1. Builds backend (Node 20) and frontend (Node 20) images
2. Starts PostgreSQL database
3. Waits for database to be ready
4. Runs database migrations
5. Seeds the database with test data
6. Starts the backend API on http://localhost:3001
7. Starts the frontend on http://localhost:3000

Everything is ready when you see:
```
web-1  | ▲ Next.js 16.1.6
web-1  | - Local:         http://localhost:3000
api-1  | [Nest] 1  - 01/01/2025, 12:00:00 AM     LOG [NestFactory] Application initialized
```

**Option B: Local Development**

If you prefer running locally without Docker:

1. Ensure PostgreSQL is running:
   ```bash
   # MacOS with Homebrew
   brew services start postgresql
   
   # Or verify it's running
   psql --version
   ```

2. Create the database:
   ```bash
   createdb oppi
   ```

3. Install dependencies:
   ```bash
   cd backend
   pnpm install
   cd ../frontend
   pnpm install
   ```

5. Generate/apply migrations and seed:
   ```bash
   cd backend
   pnpm run db:generate
   pnpm run db:migrate
   pnpm run db:seed
   ```

6. Start in development (two terminals):
   ```bash
   # Terminal 1: Backend (run from backend directory)
   cd backend
   pnpm run start:dev
   
   # Terminal 2: Frontend
   cd frontend
   pnpm run dev
   ```

**Important**: Always run backend commands from the `backend` directory.

### Using Docker (Recommended)

```bash
# Build and run entire stack
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f api    # Backend logs
docker compose logs -f web    # Frontend logs

# Stop services
docker compose down
```

Database migrations and seeding run automatically on first startup.

### Local Development Mode

**In two separate terminals:**

**Terminal 1: Backend (NestJS API)**
```bash
cd backend
pnpm run start:dev
```
The API runs on http://localhost:3001

**Terminal 2: Frontend (Next.js)**
```bash
cd frontend
pnpm run dev
```
The frontend runs on http://localhost:3000

### Manual Database Operations

If you need to manually control migrations and seeding:

```bash
cd backend

# Generate new migrations (after schema changes)
pnpm run db:generate

# Generate migration files from schema.ts changes
pnpm run db:generate

# Apply committed migrations
pnpm run db:migrate

# Push schema changes directly to your local DB without creating migration files
pnpm run db:push

# Seed database with sample data
pnpm run db:seed

# Reset database (destructive - clears all data)
pnpm run db:reset
```

You can modify seed data by editing `backend/src/database/seeds/seed.ts`

### Production Build

**Backend:**
```bash
cd backend
pnpm run build
pnpm run start:prod
```

**Frontend:**
```bash
cd frontend
pnpm run build
pnpm start
```

## Available Scripts

### Backend

```bash
# Always run from backend directory: cd backend

# Development
pnpm run start:dev        # Watch mode
pnpm run build            # Production build
pnpm run start:prod       # Run production build (node dist/src/main)

# Testing
pnpm run test             # Run unit tests
pnpm run test:all         # Run all tests (with --passWithNoTests)
pnpm run test:watch       # Watch mode
pnpm run test:cov         # With coverage

# Database
pnpm run db:generate      # Generate SQL migration files from schema changes
pnpm run db:migrate       # Apply committed migrations
pnpm run db:push          # Update local DB directly without creating migration files
pnpm run db:seed          # Seed database with test data
pnpm run db:reset         # Reset database (destructive)
The project is fully containerized with automated database setup:

```bash
# Build and run entire stack
docker compose up --build

# Run in background
docker compose up -d

# View logs (all services)
docker compose logs -f

# View specific service logs
docker compose logs -f api     # Backend API
docker compose logs -f db      # Database
docker compose logs -f web     # Frontend

# Stop services
docker compose down

# Remove volumes (database data)
docker compose down -v
```

**What happens automatically on startup:**
1. PostgreSQL database initializes
2. Database health check passes
3. Backend runs migrations
4. Backend seeds the database
5. Both API and frontend start

# Testing

```bash
# Unit tests
cd backend && pnpm test

# E2E tests (requires the test DB to be running)
docker compose up -d db-test
cd backend && pnpm test:e2e
```

E2E tests use a dedicated isolated Postgres instance (`db-test` on port 5433) and require `TEST_DATABASE_URL` to be set in `.env`.

## Project Structure

- `backend/` - NestJS API with authentication, database, and business logic
  - `src/database/` - Drizzle ORM schema, migrations, and seeds
  - `src/auth/` - Google OAuth & JWT authentication
  - `src/posts/` - Announcements module
  - `src/children/` - Child management module
  - `test/` - Unit and integration tests
- `frontend/` - Next.js 16 React application
- `docs/` - API documentation and deployment guides

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Role-based access control (Admin, Teacher, Parent)
- ✅ Announcements/Posts management
- ✅ Child profile management
- ✅ Direct messaging
- ✅ Group management
- ✅ Type-safe database with Drizzle ORM
- ✅ Comprehensive test suite
- ✅ Docker containerization

## Google OAuth Setup & Testing

### Option 1: Quick Testing (Easy)

Use fake Google IDs in the seed file for local development:

```bash
cd backend
pnpm run db:seed
```

This creates test users with placeholder Google IDs. You can manually test the login flow by modifying the seed before running.

### Option 2: Real Google OAuth Credentials (Recommended for Development)

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name it "Oppi" and click "Create"
4. Wait for the project to be created

#### Step 2: Set Up OAuth 2.0 Credentials

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, click **Configure OAuth Consent Screen** first:
   - Choose **External** for User Type
   - Fill in App name: "Oppi"
   - Add your test email for Support email
   - Click **Save and Continue** through all steps
4. Back to Credentials, click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Name it "Oppi Dev"
7. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/google/callback` (backend direct callback)
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**
10. Add them to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

#### Step 3: Add Test Users to OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Under **Test users**, click **Add users**
3. Add your test email addresses:
   - Your own email (for teacher login)
   - Additional emails (for parent logins)
4. Click **Save**

#### Step 4: Get Google IDs from OAuth Tokens

When a user logs in via Google OAuth, their token contains a `sub` field (the Google ID). You have two options:

**Option A: Using JWT Playground (Easiest)**

1. Log in to the app at `http://localhost:3000/login`
2. Complete Google OAuth flow
3. After logging in, open browser DevTools → **Application** → **Local Storage**
4. Find your JWT token and copy it
5. Go to [jwt.io](https://jwt.io)
6. Paste the token in the "Encoded" section
7. The `sub` field in the decoded payload is the Google ID
8. Copy this Google ID

**Option B: Check Backend Logs**

1. Start the backend in development mode: `cd backend && pnpm run start:dev`
2. Log in via the frontend
3. Check the backend console logs - Google OAuth responses include the `sub` field (Google ID)
4. Copy the `sub` value from the logs

#### Step 5: Update Seed File with Real Google IDs

Edit `backend/src/database/seeds/seed.ts`:

```typescript
// Replace the googleId values with real Google IDs
const teacher = await db.insert(users).values({
  googleId: "113456789012345678901", // Replace with your Google ID
  email: "your.email@gmail.com",
  name: "Jane Smith",
  role: "TEACHER",
}).returning();

const parent1 = await db.insert(users).values({
  googleId: "114567890123456789012", // Replace with second test user's Google ID
  email: "parent.test1@gmail.com",
  name: "John Doe",
  role: "PARENT",
}).returning();
```

#### Step 6: Re-seed the Database

```bash
cd backend
pnpm run db:reset    # WARNING: Deletes all data
pnpm run db:seed     # Seeds with new Google IDs
```

#### Step 7: Test the Full Authentication Flow

1. Start the backend: `cd backend && pnpm run start:dev`
2. Start the frontend: `cd frontend && pnpm run dev`
3. Navigate to `http://localhost:3000/login`
4. Click "Login with Google"
5. Sign in with one of your test user emails
6. You should be logged in and redirected to the dashboard
7. Test different roles by logging in with different test users

### Production OAuth Setup

For production:

1. Follow steps 1-3 above with your production domain
2. Update redirect URIs to use your production URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://api.yourdomain.com/auth/google/callback`
3. Set environment variables in your hosting platform:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET` (use a secure random string)
4. Use real user Google IDs when running seed in production

## Troubleshooting

**Database connection error:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Run migrations: `cd backend && pnpm run db:migrate`

**Google OAuth not working:**
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check redirect URI is configured in Google Cloud Console (must match exactly)
- Ensure test user email is added to OAuth consent screen
- Clear browser cache and cookies, then try again

**"Invalid client" error:**
- Verify Client ID and Secret are correct and from the same OAuth app
- Check that the app hasn't been deleted from Google Cloud

**Can't get Google ID:**
- Make sure user successfully completes OAuth flow and logs in
- Check browser console for error messages
- In backend logs, look for the OAuth response after user clicks "Sign in with Google"

**Port already in use:**
- Backend: Change port in `backend/src/main.ts`
- Frontend: Use `pnpm run dev -- -p 3001`

## Documentation

- [API Documentation](./docs/API.md) - Endpoint reference and authentication flow
- [Database Schema](./docs/SCHEMA.md) - Database tables and relationships
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guide](./CONTRIBUTING.md) - Development guidelines

## License

UNLICENSED
