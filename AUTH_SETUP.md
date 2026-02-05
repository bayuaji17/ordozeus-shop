# Authentication Setup

This project uses Better Auth with PostgreSQL and Drizzle ORM for authentication.

## Prerequisites

1. PostgreSQL database running
2. Update `.env.local` with your database URL

## Database Setup

1. Update the `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ordozeus_shop"
```

2. Generate and push the database schema:
```bash
bun run db:generate
bun run db:push
```

Or use the Better Auth CLI:
```bash
bunx @better-auth/cli migrate
```

## Environment Variables

Required variables in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - 32+ character secret (already generated)
- `BETTER_AUTH_URL` - Base URL (http://localhost:3000 for dev)

## Authentication Routes

- **Sign Up**: `/signup` - Create a new account
- **Sign In**: `/signin` - Log into existing account
- **API**: `/api/auth/*` - Better Auth API endpoints

## Features

- ✅ Email/Password authentication
- ✅ Session management (7-day expiry)
- ✅ Cookie-based sessions with caching
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Type-safe client and server
- ✅ Responsive UI with shadcn components

## Usage in Components

```tsx
import { useSession, signOut } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Server-Side Usage

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return <div>Protected content for {session.user.name}</div>;
}
```

## Database Schema

The following tables are created:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts and password storage
- `verification` - Email verification tokens

## Next Steps

1. Set up your PostgreSQL database
2. Run migrations: `bun run db:push`
3. Start the dev server: `bun dev`
4. Visit `/signup` to create your first account
