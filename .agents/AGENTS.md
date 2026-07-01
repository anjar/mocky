# Agent Rules for Mocky Workspace

## Supabase Configuration
- **Environment Variables**: Always use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY` when initializing Supabase clients (e.g., `createBrowserClient`, `createServerClient`).
- **Auth Redirects**: When configuring `redirectTo` properties in Supabase auth components (like `@supabase/auth-ui-react`), use dynamically determined origins (e.g., `typeof window !== 'undefined' ? \`\${window.location.origin}/auth/callback\` : undefined`) instead of hardcoded URLs.
