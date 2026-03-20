# Oppi Project Structure

A comprehensive, production-ready monorepo structure for the Oppi kindergarten
communication platform.

## Key Architectural Features

### Backend (NestJS)

- **Modular Architecture**: Each domain (auth, posts, children, etc.) is a
  self-contained module
- **Configuration System**: Environment variables only via `config.loader.ts` (dotenv + inline defaults)
- **Separation of Concerns**: Controllers, Services, and DTOs
- **Global Exception Handling**: Unified error responses
- **RBAC**: Role-based access control with `@Roles()` decorator
- **Structured Logging**: nestjs-pino with conditional pino-pretty (dev only)
- **Database Layer**: Drizzle ORM 0.45+ with PostgreSQL
- **Database Migrations**: drizzle-kit 0.28+ with auto-discovery
- **Authentication**: Google OAuth 2.0 + JWT in secure HttpOnly cookies
- **Build Output**: Compiled to `dist/src/` (entry point: `dist/src/main.js`)
- **Docker**: Node 20 Alpine with automated migrations, seeding, and startup

### Frontend (Next.js 16.1.6)

- **App Router**: Modern file-based routing with React Server Components
- **Type Safety**: Full TypeScript with strict mode
- **Component Architecture**: Shadcn/UI + Lucide for consistent UI
- **Custom Hooks**: `useApi` for centralized API calls with error toasts (Sonner)
- **Context API**: AuthContext for global user state
- **Services Layer**: Dedicated service classes for API communication
- **Utility Functions**: Date formatting, class merging (tailwind-merge), etc.
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Docker**: Node 20 Alpine

### Shared Conventions

- **Environment Variables**: `.env.example` template for easy setup
- **Configuration**: Backend uses environment variables only via `config.loader.ts`
- **Code Quality**: ESLint + Prettier for consistent formatting
- **Git Workflow**: CONTRIBUTING.md for standardized contributions
- **CI/CD**: GitHub Actions for automated testing & builds (Node 20, pnpm, test:all)
- **Documentation**: Comprehensive API, schema, and deployment guides
- **Docker Orchestration**: docker-compose.yml with health checks and dependencies

## Getting Started

See [README.md](../README.md) for quick start instructions.

## File Statistics

- **Backend**: 20+ TypeScript files (modules, controllers, services, DTOs)
- **Frontend**: 15+ React/TypeScript files (pages, components, hooks, services)
- **Documentation**: 4 markdown files (API, schema, deployment, contributing)
- **Configuration**: 5+ root-level config files (eslint, prettier, docker)

## Best Practices Implemented

✅ Monorepo structure with clear separation  
✅ Type-safe across frontend and backend  
✅ Environment-based configuration  
✅ Error handling and validation  
✅ Authentication & authorization  
✅ Structured logging  
✅ Docker containerization  
✅ CI/CD ready  
✅ Well-documented  
✅ Production-ready patterns  
