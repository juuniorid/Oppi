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
