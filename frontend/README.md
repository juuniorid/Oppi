# Oppi Frontend

This folder contains the Next.js 16.1.6 (App Router) frontend for the Oppi platform.

## Tech Stack

- **Framework**: [Next.js 16.1.6](https://nextjs.org) (App Router)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) for page layout and route shells,
  [Material UI](https://mui.com/) for reusable UI components,
  [Shadcn/UI](https://ui.shadcn.com), [Lucide React](https://lucide.dev/react),
  [Sonner](https://sonner.drkrs.work) (toast notifications)
- **Utilities**: class-variance-authority, clsx, tailwind-merge
- **Auth / API**: Communicates with backend via fetch; authenticated requests
  include credentials and use JWT cookies
- **State Management**: React hooks with `useApi` wrapper for error handling
- **Containerization**: Docker with Node.js 20 Alpine
- **Package Manager**: pnpm

## Quick Start with Docker

The easiest way to run the entire project (database, backend, and frontend):

```bash
# From project root
docker compose up --build
```

This automatically:

- Starts PostgreSQL database
- Starts the backend API on http://localhost:3001
- Starts the frontend on http://localhost:3000
- Database runs with automated migrations and seeding

## Local Development Setup

1. Install dependencies:

   ```bash
   cd frontend
   pnpm install
   ```

2. Create `.env.local` (optional, uses default if not present):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. Run in development mode:
   ```bash
   pnpm run dev
   ```

The frontend will be available at http://localhost:3000

**Important**: Make sure the backend API is running on http://localhost:3001 before starting the frontend.

## Available Scripts

```bash
pnpm run dev          # Start development server (port 3000)
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
```

## Features

- **Styling Approach**:
  - Use Tailwind utility classes in `layout.tsx` files and page containers for layout,
    spacing, and responsive structure
  - Use Material UI components for shared interactive UI such as buttons, cards,
    form fields, lists, and avatars
  - Global MUI theming is provided through `src/components/providers.tsx`

- **Authentication Flow**:
  - `/login` page with "Sign in with Google" button
  - Redirects to backend OAuth endpoint
  - Sets JWT cookie on successful authentication
  - Automatic redirect to dashboard

- **Dashboard Layout**:
  - Sidebar navigation with role-based access
  - `/dashboard/announcements` - View and create posts (teachers)
  - `/dashboard/group` - View children in your group
  - `/dashboard/messages` - Direct messaging (coming soon)

- **API Integration**:
  - `useApi` hook wraps fetch with error handling
  - Automatic toast notifications on errors (via Sonner)
  - Credentials included for JWT cookie authentication

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   └── dashboard/          # Protected routes
│   │       ├── layout.tsx      # Dashboard layout with sidebar
│   │       ├── page.tsx        # Dashboard home
│   │       ├── announcements/
│   │       │   └── page.tsx    # Announcements feed
│   │       ├── group/
│   │       │   └── page.tsx    # Group/children view
│   │       └── messages/
│   │           └── page.tsx    # Messaging (placeholder)
│   ├── components/
│   │   ├── Sidebar.tsx         # Dashboard sidebar
│   │   └── ui/                 # Shadcn/UI components
│   │       └── button.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state
│   ├── hooks/
│   │   └── useApi.ts           # API wrapper with error handling
│   ├── services/               # API service layer
│   │   ├── auth.service.ts
│   │   ├── post.service.ts
│   │   └── child.service.ts
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── date.ts             # Date formatting utilities
│   └── lib/
│       └── utils.ts            # Tailwind class merge helper
├── public/                     # Static assets
├── Dockerfile                  # Docker image definition
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.mjs
```

## Key Components

### useApi Hook

Custom hook for API calls with error handling:

```typescript
const { data, loading, error } = useApi<Post[]>('/posts/group/1');
```

### Sidebar Component

Navigation sidebar with role-based menu items:

- Announcements (all users)
- My Group (all users)
- Messages (all users)

### AuthContext

Global authentication state management:

- Current user information
- Login/logout functions
- Protected route handling

## Configuration

The frontend expects the backend API at `http://localhost:3001` by default. To change this:

1. Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. For production, update in deployment environment variables

## Docker

Build and run the frontend container:

```bash
# From project root
docker compose up web

# Or build individually
cd frontend
docker build -t oppi-frontend .
docker run -p 3000:3000 oppi-frontend
```

## Troubleshooting

**API requests fail with CORS errors:**

- Ensure backend is running on http://localhost:3001
- Check backend has CORS enabled for http://localhost:3000
- Verify cookies are being sent (credentials: 'include')

**Google OAuth redirect fails:**

- Check backend `GOOGLE_CALLBACK_URL` matches Google Cloud Console
- Ensure redirect URI is whitelisted in Google OAuth settings

**Build errors:**

- Run `pnpm install` to ensure dependencies are up to date
- Clear `.next` folder: `rm -rf .next`
- Check Node version is 20+

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [Sonner](https://sonner.drkrs.work)
- [Lucide Icons](https://lucide.dev)
