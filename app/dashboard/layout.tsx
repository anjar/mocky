import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 min-h-screen">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background sticky top-0 z-10">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 text-sm">
          <Link href="/dashboard" className="font-bold text-xl hover:opacity-80">MockIt Dashboard</Link>
          <div className="flex items-center gap-4">
            <span className="text-foreground/80">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover border border-foreground/10">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4">
        {children}
      </main>
    </div>
  );
}
