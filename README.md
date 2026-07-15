# Mocky

Mocky is a simple API mocking website built with a vibe-coded workflow using Google Jules and Claude Code. The design direction was created with Google Stitch, and the project is hosted on Vercel and powered by Supabase.

## What this project is for

Mocky is focused on creating a lightweight place to define and serve mock API endpoints. It is intended to keep the workflow simple, fast, and easy to iterate on.

## Stack

- Next.js
- Supabase
- Vercel
- Google Stitch for design direction
- Google Jules and Claude Code for the vibe-coded build process

## Run Locally

1. Install dependencies:

  ```bash
  npm install
  ```

2. Create a local environment file named `.env.local` and add your Supabase credentials:

  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```

3. Start the development server:

  ```bash
  npm run dev
  ```

4. Open the app in your browser at [http://localhost:5000](http://localhost:5000).

## Deployment

The project is designed to run on Vercel with Supabase as the backend service.
