# Agent Instructions for Mocky

## Commands & Workflow
- **Dev Server:** `npm run dev` (starts on `http://localhost:5000`)
- **Testing:** There are no test scripts in this project. Do not attempt to run tests.

## Supabase & Auth Constraints
- **Client Initialization:** Always use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY` when setting up Supabase clients.
- **Service Role:** `SUPABASE_SERVICE_ROLE_KEY` is required for the mock engine to bypass Row-Level Security (RLS). Use the `utils/supabase/admin.ts` client for this.
- **Auth Redirects:** `redirectTo` URLs (e.g., in `@supabase/auth-ui-react`) must be determined dynamically (e.g., `typeof window !== 'undefined' ? \`\${window.location.origin}/auth/callback\` : undefined`). Never hardcode redirect URLs.
- **Route Protection:** Guard routes by checking auth in layout Server Components, not via Next.js middleware. Redirect unauthenticated users to `/login`.

## Architecture & Conventions
- **Data Mutations:** The dashboard uses Next.js Server Actions exclusively. Do not create separate API routes for CRUD operations. Use `revalidatePath()` to refresh data.
- **Mock Engine:** All mock HTTP requests (GET, POST, PUT, PATCH, DELETE, OPTIONS) route to `app/api/mock/[projectId]/[[...path]]/route.ts` and are handled by a single `handleMockRequest` function.
- **Admin Roles:** Check admin status using `isUserAdmin()` exported from `utils/supabase/admin.ts`.
