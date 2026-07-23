# Mocky

**A simple, self-hostable API mocking platform for frontend, backend, and QA workflows.**

Mocky lets you create predictable HTTP endpoints before a real backend is ready. Define a route, choose its response status, headers, JSON body, latency, and expiry, then use the generated URL from your application, test suite, or terminal.

It is intentionally small: no complex scenario builder, no proprietary runtime, and no external mock server to manage.

## Why Mocky?

Frontend development should not stop while an API is unfinished. QA should be able to reproduce slow or failing responses without changing production code. Backend developers should be able to share an agreed response contract before implementing it.

Mocky provides one focused workspace for those jobs.

## Features

- Create isolated mock API projects with stable base URLs
- Configure `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` routes
- Return custom JSON bodies, headers, and common HTTP status codes
- Simulate network latency per endpoint
- Set endpoint expiry to 1, 7, 14, or 30 days
- Preview response contracts while creating an endpoint
- Open endpoints directly or copy a ready-to-run cURL command
- Edit endpoint responses without changing their method or path
- Light and dark themes
- Supabase authentication and Row-Level Security
- Administrative views for users, projects, and endpoints
- Optional Google Tag Manager integration

## Tech Stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) for Postgres and authentication
- [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started

### Prerequisites

- A recent Node.js LTS release
- npm
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/anjar/mocky.git
cd mocky
npm install
```

### 2. Create the database

Open the Supabase SQL Editor and run:

```text
supabase/schema.sql
```

The schema creates the project and endpoint tables, indexes, cleanup function, and Row-Level Security policies.

### 3. Configure the environment

Copy the example file:

```bash
cp .env.example .env.local
```

Set the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

SITE_URL=http://localhost:5000

# Optional: leave empty to disable Google Tag Manager
NEXT_PUBLIC_GTM_ID=
```

`SUPABASE_SERVICE_ROLE_KEY` is required by the public mock engine so it can serve configured responses independently of dashboard sessions. It must remain server-side and must never be exposed with a `NEXT_PUBLIC_` prefix.

### 4. Start the application

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000).

## Using a Mock Endpoint

Create a project, add an endpoint, then call the generated URL:

```bash
curl -X GET \
  'http://localhost:5000/api/mock/your-project-prefix/users/1'
```

For a request with a JSON body:

```bash
curl -X POST \
  'http://localhost:5000/api/mock/your-project-prefix/orders' \
  -H 'Content-Type: application/json' \
  --data-raw '{"product_id":"sku_123","quantity":1}'
```

Mocky matches requests using the project prefix, HTTP method, and configured path. It then applies the endpoint delay and returns the saved status, headers, and JSON body.

## Project Structure

```text
app/
├── api/mock/                         Public mock request engine
├── dashboard/                        User projects and endpoint editor
├── admin/                            Administrative views
└── login, signup, password recovery  Authentication screens

utils/supabase/                        Browser, server, and admin clients
supabase/schema.sql                    Database schema and RLS policies
tokens.css                            Shared light and dark design tokens
```

Dashboard mutations use Next.js Server Actions. Mock HTTP requests are handled by the catch-all route at:

```text
app/api/mock/[projectId]/[[...path]]/route.ts
```

## Production Deployment

Mocky can run on any platform that supports Next.js. When deploying:

1. Configure all required environment variables.
2. Set `SITE_URL` to the public origin without a trailing slash.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
4. Configure the corresponding public origin in Supabase Auth.
5. Optionally set `NEXT_PUBLIC_GTM_ID` to a valid `GTM-...` container ID.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a focused branch.
3. Make and verify your changes.
4. Open a pull request explaining the problem and solution.

Please keep Mocky focused. Small, understandable improvements are preferred over large abstractions.

## Security

If you discover a security issue, do not publish sensitive details in a public issue. Use [GitHub private vulnerability reporting](https://github.com/anjar/mocky/security/advisories/new) so the problem can be investigated and fixed responsibly.

## License

Mocky is available under the [MIT License](LICENSE). You may use, modify, distribute, and include it in personal or commercial projects.
