# Oppi Project Structure

A comprehensive, production-ready monorepo structure for the Oppi kindergarten
communication platform.

## Directory Overview

```
Oppi/
│
├── � drizzle.config.ts        # Drizzle Kit configuration (root + backend copy)
├── 📄 docker-compose.yml       # Docker Compose setup
├── 📄 .env.example             # Environment variables template
├── 📄 .dockerignore            # Docker build exclusions
│
├── 📁 backend/                 # NestJS API
│   ├── 📄 drizzle.config.ts    # Drizzle Kit configuration (used by Docker)
│   ├── 📄 Dockerfile           # Backend container
│   ├── 📄 entrypoint.sh        # Container startup script
│   ├── 📄 package.json         # Backend dependencies
│   ├── 📄 tsconfig.json        # TypeScript config
│   ├── 📄 .dockerignore        # Backend Docker exclusions
│   ├── src/
│   │   ├── database/           # Drizzle ORM & Migrations
│   │   │   ├── db.ts           # Database connection
│   │   │   ├── schema.ts       # Drizzle table definitions
│   │   │   ├── migrations/     # Database migrations
│   │   │   ├── seeds/          # Seed data
│   │   │   │   └── seed.ts
│   │   │   └── scripts/        # Database scripts
│   │   │       ├── init.sh
│   │   │       └── reset.sh
│   │   ├── auth/              # Google OAuth & JWT
│   │   │   ├── google.strategy.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── auth.module.ts
│   │   ├── posts/             # Announcements
│   │   │   ├── posts.controller.ts
│   │   │   ├── posts.service.ts
│   │   │   └── posts.module.ts
│   │   ├── children/          # Child management
│   │   │   ├── children.controller.ts
│   │   │   ├── children.service.ts
│   │   │   └── children.module.ts
│   │   ├── groups/            # Group/Class management
│   │   │   └── groups.module.ts
│   │   ├── messages/          # Messaging system
│   │   │   └── messages.module.ts
│   │   ├── users/             # User management
│   │   │   └── users.module.ts
│   │   ├── common/            # Shared utilities
│   │   │   ├── dto/           # Data transfer objects
│   │   │   │   ├── jwt.payload.ts
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   ├── create-message.dto.ts
│   │   │   │   └── api-response.dto.ts
│   │   │   ├── decorators/    # Custom decorators
│   │   │   │   ├── roles.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/    # Express middleware
│   │   │   │   └── cors.middleware.ts
│   │   │   └── filters/       # Exception filters
│   │   │       ├── global-exception.filter.ts
│   │   │       └── index.ts
│   │   ├── config/            # Configuration
│   │   │   ├── app.config.ts
│   │   │   └── config.loader.ts
│   │   ├── app.module.ts      # Root module
│   │   ├── main.ts            # Entry point
│   ├── test/                  # Test files (Jest)
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📁 frontend/               # Next.js 16.1.6 Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/    # Protected dashboard
│   │   │       ├── layout.tsx  # Sidebar layout
│   │   │       ├── page.tsx
│   │   │       ├── announcements/
│   │   │       │   └── page.tsx
│   │   │       ├── group/
│   │   │       │   └── page.tsx
│   │   │       └── messages/
│   │   │           └── page.tsx
│   │   ├── components/       # Reusable components
│   │   │   ├── sidebar.tsx
│   │   │   └── ui/          # Shadcn/UI components
│   │   │       └── button.tsx
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useApi.ts    # API wrapper with error handling
│   │   ├── services/        # API services
│   │   │   ├── auth.service.ts
│   │   │   ├── post.service.ts
│   │   │   └── child.service.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── date.ts
│   │   └── lib/             # Library functions
│   │       └── utils.ts     # Tailwind class merge
│   ├── public/              # Static assets
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   └── README.md
│
├── 📁 docs/                  # Documentation
│   ├── API.md               # API endpoints & auth flow
│   ├── SCHEMA.md            # Database schema reference
│   └── DEPLOYMENT.md        # Production deployment guide
│
├── 📁 scripts/              # Utility scripts
│   ├── build.sh             # Build script
│   └── dev.sh               # Development startup
│
├── 📁 .github/              # GitHub configuration
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
│
├── 📄 Root Configuration
│   ├── docker-compose.yml   # Local development stack
│   ├── .env.example         # Environment template
│   ├── .eslintrc.json       # ESLint rules
│   ├── .prettierrc           # Code formatting
│   ├── .gitignore           # Git exclusions
│   ├── README.md            # Project overview
│   └── CONTRIBUTING.md      # Contribution guidelines
```

## Key Architectural Features

### Backend (NestJS)

- **Modular Architecture**: Each domain (auth, posts, children, etc.) is a
  self-contained module
- **Configuration System**: `config.json` with environment variable overrides via `config.loader.ts`
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
- **Configuration**: Backend uses `config.json` + environment overrides
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
