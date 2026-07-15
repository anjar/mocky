# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mocky** (internally called "MockIt") is a multi-tenant API mocking platform. Users create projects (each with a unique `api_prefix`) and define mock endpoints. Any HTTP request to `/api/mock/:apiPrefix/:path` is served back a configurable status code, headers, and JSON body — with optional artificial delay.

Stack: Next.js App Router · React 19 · Supabase (PostgreSQL + Auth + RLS) · Tailwind CSS v4 · TypeScript · deployed on Vercel.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:5000
npm run build        # production build
npm run start        # start production server
```

There are no test scripts in this project.

## Environment Variables

Copy `.env.example` to `.env.local` and populate:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # NOT ANON_KEY — see agent rules below
SUPABASE_SERVICE_ROLE_KEY=              # required for the mock engine to bypass RLS
```

> **Important (from `.agents/AGENTS.md`):** Always use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY` — when initializing Supabase clients. Auth `redirectTo` values must be dynamically determined (e.g. `window.location.origin`), never hardcoded URLs.

## Architecture

### Data Model (`supabase/schema.sql`)

Two core tables with Row-Level Security:
- **`projects`** — owned by a user; has a globally unique `api_prefix` (e.g. `pr_1a2b3c`)
- **`endpoints`** — belongs to a project; keyed by `(project_id, method, path)`; has `response_status`, `response_headers` (JSONB), `response_body` (JSONB), `delay_ms`, and `expires_at` (auto-set to 30 days; a `pg_cron` job deletes expired rows daily)

### Supabase Client Factories (`utils/supabase/`)

| File | Purpose |
|---|---|
| `client.ts` | Browser client (React Client Components) |
| `server.ts` | Server client with cookie store (Server Components, Server Actions) |
| `admin.ts` | Service-role client that bypasses RLS; also exports `isUserAdmin()` |
| `proxy.ts` | Middleware-style client used in the proxy handler |

### App Router Structure

```
app/
  api/mock/[projectId]/[[...path]]/route.ts  ← core mock engine (all HTTP methods)
  auth/callback/route.ts                      ← Supabase OAuth callback
  auth/signout/route.ts                       ← sign-out action
  dashboard/                                  ← user-facing (requires auth)
    layout.tsx                                ← auth guard + nav
    page.tsx                                  ← project list + create form
    projects/[id]/page.tsx                    ← endpoint CRUD for a project
  admin/                                      ← admin panel (requires is_admin role)
    layout.tsx                                ← admin auth guard + sidebar
    page.tsx / users/ / projects/ / endpoints/
  login/page.tsx
  page.tsx                                    ← landing
```

### Mock Engine (`app/api/mock/[projectId]/[[...path]]/route.ts`)

All HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS) are handled by a single `handleMockRequest` function:
1. Extracts `api_prefix` and `path` from route params
2. Uses the **service-role key** (bypasses RLS) to query the `projects` table by `api_prefix`
3. Queries `endpoints` table for the matching `(project_id, method, path)`
4. Applies `delay_ms` delay if set
5. Returns the stored `response_status`, `response_headers`, and `response_body`
6. OPTIONS requests get CORS headers automatically

### Data Mutations

The dashboard uses **Next.js Server Actions** (no separate API routes) — forms call `action={serverAction}` and mutations use `revalidatePath()` to refresh data. No client-side fetch for CRUD.

### Admin Access

Admin role is determined by `isUserAdmin()` in `utils/supabase/admin.ts`, checking `user.role`, `user.user_metadata.role`, or `user.app_metadata.is_admin`. In development (or when `ALLOW_DEV_ADMIN_PROMOTION=true`), the admin layout shows a "Become Admin" button that sets `user_metadata.is_admin = true`.

### Auth Flow

- `/login` — Supabase Auth UI (`@supabase/auth-ui-react`)
- `/auth/callback` — handles the OAuth/magic-link redirect
- `/auth/signout` — POST route that calls `supabase.auth.signOut()`
- Route protection is done in layout Server Components (redirect to `/login` if no user), not via middleware
