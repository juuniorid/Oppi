# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Environment variables configured
- Registered Google OAuth credentials

## Local Deployment

1. Copy `.env.example` to `.env` and fill in values
2. Run: `docker-compose up --build`
3. Access at http://localhost:3000

## Production Deployment

### Using Docker Compose

1. Create `docker-compose.prod.yml` with production settings
2. Set secure environment variables
3. Run: `docker-compose -f docker-compose.prod.yml up -d`

### Using Coolify With Nixpacks

Deploy the frontend and backend as two separate Coolify applications.

For each Coolify app:

1. Set the repository to this monorepo.
2. Set **Build Pack** to `Nixpacks`.
3. Set **Base Directory** to the app folder:
	- Backend: `backend`
	- Frontend: `frontend`
4. Leave the Dockerfile fields empty for Nixpacks deployments.

This repository does not have a root-level Node application. If Coolify builds from the repository root, Nixpacks will fail because the root `package.json` does not define `build` or `start` scripts.

The app-local `nixpacks.toml` files define the correct commands for each service:

- `backend/nixpacks.toml` installs dependencies, runs `pnpm run build`, and starts with `pnpm run start:prod`
- `frontend/nixpacks.toml` installs dependencies, runs `pnpm run build`, and starts with `pnpm run start`

Recommended runtime configuration:

- Backend: provide `DATABASE_URL`, `JWT_SECRET`, OAuth variables, `FRONTEND_URL`, and `PORT`
- Frontend: provide `NEXT_PUBLIC_API_URL` pointing to the deployed backend URL

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<secure-random-string>
GOOGLE_CLIENT_ID=<prod-client-id>
GOOGLE_CLIENT_SECRET=<prod-client-secret>
DATABASE_URL=<prod-database-url>
FRONTEND_URL=https://yourdomain.com
```

### Database Migrations

Run Drizzle migrations before starting the app:

```bash
cd backend
pnpm run db:generate  # Generate migrations if needed
pnpm run db:migrate   # Run migrations
pnpm run db:seed      # Seed initial data (optional)
```

### SSL/TLS

- Use a reverse proxy (nginx) for HTTPS
- Configure secure cookie flags in production
- Set `secure: true` in JWT cookie settings

### Monitoring

- Enable nestjs-pino structured logging
- Configure log aggregation (e.g., ELK stack)
- Monitor database connections
- Set up alerts for errors

### Backup

- Regular database backups
- Document recovery procedures
- Test restore process periodically
