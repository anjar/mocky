import { redirect } from "next/navigation";
import { createAdminClient, isUserAdmin } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { revalidatePath } from "next/cache";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAdminClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const isAdmin = isUserAdmin(user);

  // Server action to grant the current user admin role for testing/development
  async function makeMeAdmin() {
    "use server";
    // This is STRICTLY for local development / testing purposes.
    // In production, we only allow this action if the environment is explicitly configured.
    if (process.env.NODE_ENV !== 'development' && process.env.ALLOW_DEV_ADMIN_PROMOTION !== 'true') {
      throw new Error("Privilege escalation is disabled in production.");
    }

    const client = await createAdminClient(cookies());
    const { data: { user: currentUser } } = await client.auth.getUser();
    if (!currentUser) return;

    // Merge or update metadata to include is_admin or role: is_admin
    await client.auth.updateUser({
      data: {
        role: "is_admin",
        is_admin: true,
      },
    });

    revalidatePath("/admin");
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 w-full flex flex-col justify-center items-center min-h-screen px-4 py-12 bg-background text-foreground">
        <div className="max-w-md w-full border border-red-200 dark:border-red-900/30 rounded-xl p-8 bg-card shadow-lg text-center flex flex-col gap-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Access Denied
            </h1>
            <p className="text-sm text-gray-500">
              You do not have administrative privileges to access the admin dashboard.
            </p>
          </div>

          <div className="text-xs bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-left font-mono text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
            <div><span className="font-semibold text-gray-400">Logged in as:</span> <span className="text-foreground">{user.email}</span></div>
            <div><span className="font-semibold text-gray-400">User ID:</span> <span className="text-foreground text-[10px]">{user.id}</span></div>
            <div><span className="font-semibold text-gray-400">Admin Meta:</span> <span className="text-foreground">{JSON.stringify(user.user_metadata?.role || user.user_metadata?.is_admin || null)}</span></div>
          </div>

          <div className="flex flex-col gap-3">
            {(process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_ADMIN_PROMOTION === 'true') && (
              <form action={makeMeAdmin}>
                <button
                  type="submit"
                  className="w-full bg-[#24b47e] hover:bg-[#20a070] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Become Admin (Grant Role)
                </button>
              </form>
            )}
            <div className="flex gap-4 justify-center items-center mt-2">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
              >
                &larr; Standard Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <form action="/auth/signout" method="post">
                <button className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-0 min-h-screen">
      {/* Top Navbar */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-7xl flex justify-between items-center px-6 text-sm">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-xl hover:opacity-80 flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
              Mocky Admin
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-foreground transition-colors font-medium text-xs"
            >
              Back to User Dashboard &rarr;
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-foreground/80 font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-xs font-mono">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button className="py-1.5 px-4 rounded-md text-xs font-semibold bg-btn-background hover:bg-btn-background-hover border border-foreground/10 transition-colors">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-foreground/10 hidden md:flex flex-col gap-6 py-8 px-4 bg-gray-50/50 dark:bg-gray-900/10">
          <div className="flex flex-col gap-1.5 px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Navigation</span>
            <p className="text-xs text-gray-500">Superuser Control Panel</p>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              Overview
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Users
            </Link>
            <Link
              href="/admin/projects"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Projects
            </Link>
            <Link
              href="/admin/endpoints"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              Endpoints
            </Link>
          </nav>
        </aside>

        {/* Dynamic page content */}
        <main className="flex-1 py-8 px-6 md:px-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
