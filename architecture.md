# MockIt - API Mocking Platform Architecture

## System Architecture

The system is designed as a scalable, serverless architecture using Next.js (App Router) deployed on Vercel, with Supabase acting as the Backend-as-a-Service (BaaS) for PostgreSQL database, Authentication, and Row Level Security (RLS).

### Components:
1. **Frontend:** React + Next.js App Router, styled with Tailwind CSS.
2. **Backend (API Routes):** Next.js Serverless Functions (`/api/mock/...`) handle the high-throughput mock requests.
3. **Database:** Supabase (PostgreSQL) with Row-Level Security (RLS) ensuring users can only access their own data.
4. **Auth:** Supabase Auth (JWT-based) integrated with Next.js Middleware for route protection.

### Scaling Strategy:
- **Compute:** Vercel serverless functions scale automatically from 0 to thousands of concurrent requests. Edge caching can be added for mock responses.
- **Database:** Supabase handles connection pooling (PgBouncer/Supavisor) allowing scalable database access from serverless functions. Indexing on `project_id` and `path` for fast endpoint resolution.

---

## Database Schema (PostgreSQL via Supabase)

We need a multi-tenant schema where users can create multiple projects, and each project has multiple mock endpoints.

```sql
-- Users table is managed by Supabase Auth (auth.users)

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  api_prefix TEXT UNIQUE NOT NULL, -- e.g., 'pr_1a2b3c' -> api.mockit.com/pr_1a2b3c/...
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for quick lookup
CREATE INDEX idx_projects_api_prefix ON projects(api_prefix);

-- Endpoints
CREATE TABLE endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  method TEXT NOT NULL, -- 'GET', 'POST', 'PUT', 'DELETE', etc.
  path TEXT NOT NULL, -- e.g., '/users/1'
  response_status INTEGER DEFAULT 200,
  response_headers JSONB DEFAULT '{}'::jsonb,
  response_body JSONB DEFAULT '{}'::jsonb,
  delay_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, method, path)
);
-- Index for resolving incoming mock requests quickly
CREATE INDEX idx_endpoints_lookup ON endpoints(project_id, method, path);
```

---

## File Structure

```
├── app/
│   ├── api/
│   │   └── mock/
│   │       └── [apiPrefix]/
│   │           └── [[...path]]/
│   │               └── route.ts       # Core mock resolution engine
│   ├── dashboard/
│   │   ├── layout.tsx                 # Protected dashboard layout
│   │   ├── page.tsx                   # List of projects
│   │   └── projects/
│   │       └── [id]/
│   │           └── page.tsx           # Endpoint management for a project
│   ├── login/
│   │   └── page.tsx                   # Authentication UI
│   ├── page.tsx                       # Landing page
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Tailwind imports
├── components/
│   ├── ui/                            # Reusable UI components (buttons, inputs)
│   ├── AuthButton.tsx                 # Login/Logout button
│   └── DashboardNav.tsx               # Navigation for dashboard
├── lib/                               # Utility functions
├── utils/
│   └── supabase/                      # Supabase SSR clients (server/client/middleware)
├── supabase/
│   └── migrations/                    # SQL migrations
└── architecture.md                    # This document
```

---

## API Endpoints

### Internal App APIs (Handled by Server Actions / Supabase direct)
Instead of building traditional REST APIs for the dashboard, we utilize Next.js Server Actions and direct Supabase Client queries from Server Components to fetch and mutate data, providing a faster, type-safe development experience.

### Core Mock Engine API
- **URL:** `/api/mock/:apiPrefix/*`
- **Method:** `ANY` (GET, POST, PUT, DELETE, PATCH, OPTIONS)
- **Description:** The core engine that receives external requests, matches them against the database, and returns the customized response.
- **Flow:**
  1. Extract `apiPrefix`, HTTP `method`, and `path` from the request.
  2. Query `projects` table for `apiPrefix`.
  3. Query `endpoints` table for the specific project, method, and path.
  4. (Optional) Simulate network delay (`delay_ms`).
  5. Construct response with `response_status`, `response_headers`, and `response_body`.
  6. Return response to the client.

---

## UI Architecture

### Server-Side Rendering (SSR) First
- **App Router:** We heavily use Next.js React Server Components (RSC) to fetch data (projects, endpoints) securely on the server without exposing data fetching logic to the client.
- **Client Components:** Limited to interactive areas (forms, state management for endpoint creation, modals). Marked with `"use client"`.

### Design System
- **Tailwind CSS:** Utility-first CSS for rapid, scalable styling.
- **Responsiveness:** Mobile-first approach, ensuring the dashboard works on all devices.
- **Accessibility:** Semantic HTML and ARIA roles where appropriate.
