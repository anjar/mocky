import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Index() {
  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';
    const supabase = await createClient(cookies());
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div className="font-bold text-xl">MockIt</div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-foreground/70">Hi, {user.email}</span>
                <form action={signOut}>
                  <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3 w-full mt-20">
        <main className="flex-1 flex flex-col gap-6 items-center text-center">
          <h1 className="text-5xl font-bold lg:text-6xl text-foreground">
            API Mocking Made Simple
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl">
            Create mock APIs in seconds. Test your frontend without waiting for the backend.
            Scalable, reliable, and entirely serverless.
          </p>
          <div className="flex gap-4 mt-8">
            {user ? (
              <Link
                href="/dashboard"
                className="py-3 px-6 rounded-md no-underline bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="py-3 px-6 rounded-md no-underline bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
              >
                Get Started for Free
              </Link>
            )}
            <Link
              href="#features"
              className="py-3 px-6 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover font-medium transition-colors border border-foreground/10"
            >
              View Features
            </Link>
          </div>
        </main>

        <section id="features" className="w-full flex flex-col gap-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why MockIt?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4 p-6 border border-foreground/10 rounded-lg">
              <h3 className="text-xl font-bold">Instant Setup</h3>
              <p className="text-foreground/70">Create a project and start adding endpoints immediately. No complex configuration required.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 border border-foreground/10 rounded-lg">
              <h3 className="text-xl font-bold">Custom Responses</h3>
              <p className="text-foreground/70">Define exactly what your API should return. Support for custom JSON bodies, headers, and status codes.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 border border-foreground/10 rounded-lg">
              <h3 className="text-xl font-bold">Network Simulation</h3>
              <p className="text-foreground/70">Add artificial delays to your endpoints to test how your frontend handles slow network conditions.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{' '}
          <a
            href="https://supabase.com/"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>{' '}
          and{' '}
          <a
            href="https://nextjs.org/"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
      </footer>
    </div>
  );
}
