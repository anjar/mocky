import { cookies } from "next/headers";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersList() {
  const supabase = await createAdminClient(cookies());

  let usersList: any[] = [];
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (!usersError && users) {
      usersList = users;
    }
  } catch (err) {
    console.error("Error fetching users list for admin view:", err);
  }

  // Fetch all projects to compute the project count per user
  const { data: projects } = await supabase.from("projects").select("id, user_id");

  // Map projects count to users
  const usersWithMeta = usersList.map((user) => {
    const userProjects = projects?.filter((p) => p.user_id === user.id) || [];
    return {
      ...user,
      projectsCount: userProjects.length,
    };
  });

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>
          <p className="text-gray-500 text-sm">
            Manage and view all registered users and their platform usage analytics.
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground">
          Total Users: {usersList.length}
        </div>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/10 bg-gray-50/50 dark:bg-gray-800/20 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6">User Email</th>
                <th className="py-4 px-6">User ID</th>
                <th className="py-4 px-6">Role / Metadata</th>
                <th className="py-4 px-6 text-center">Projects Owned</th>
                <th className="py-4 px-6">Created At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-sm">
              {usersWithMeta.map((user) => {
                const isUserAdmin =
                  user.user_metadata?.role === "is_admin" ||
                  user.user_metadata?.is_admin === true ||
                  user.app_metadata?.role === "is_admin" ||
                  user.app_metadata?.is_admin === true;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {user.email}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-400 break-all max-w-[120px]">
                      {user.id}
                    </td>
                    <td className="py-4 px-6">
                      {isUserAdmin ? (
                        <span className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-200 dark:border-red-900/10">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded">
                          Standard User
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-foreground">
                      {user.projectsCount}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#24b47e] hover:text-[#20a070] transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-md border border-foreground/5"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {usersWithMeta.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No users found in this database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
