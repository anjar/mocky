import { cookies } from "next/headers";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  const supabase = await createAdminClient(cookies());

  // Fetch users count (using supabase auth schema requires admin/service_role client, or query schema)
  // Let's query auth.users. Supabase Client with service key allows us to call auth.admin.listUsers()!
  let usersList: any[] = [];
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (!usersError && users) {
      usersList = users;
    }
  } catch (err) {
    console.error("Error fetching admin users list:", err);
  }

  // Fetch all projects across all users
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all endpoints across all projects
  const { data: endpoints, error: endpointsError } = await supabase
    .from("endpoints")
    .select("*")
    .order("created_at", { ascending: false });

  const totalUsers = usersList.length;
  const totalProjects = projects?.length || 0;
  const totalEndpoints = endpoints?.length || 0;
  const averageEndpoints = totalProjects > 0 ? (totalEndpoints / totalProjects).toFixed(1) : "0";

  // Get recent 5 projects
  const recentProjects = projects?.slice(0, 5) || [];
  // Get recent 5 endpoints
  const recentEndpoints = endpoints?.slice(0, 5) || [];

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-gray-500 text-sm">
          A bird's-eye view of all Mocky operations, metrics, projects, and users.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Users</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold">{totalUsers}</span>
            <span className="text-xs text-gray-400 mt-1">Platform registrants</span>
          </div>
        </div>

        {/* Projects Card */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold">{totalProjects}</span>
            <span className="text-xs text-gray-400 mt-1">Active workspaces</span>
          </div>
        </div>

        {/* Endpoints Card */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Endpoints</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold">{totalEndpoints}</span>
            <span className="text-xs text-gray-400 mt-1">Mock endpoints</span>
          </div>
        </div>

        {/* Average Card */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Avg Endpoints</span>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold">{averageEndpoints}</span>
            <span className="text-xs text-gray-400 mt-1">Endpoints per project</span>
          </div>
        </div>
      </div>

      {/* Grid Recent List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Recent Projects list */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Projects</h2>
            <Link href="/admin/projects" className="text-xs font-semibold text-[#24b47e] hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentProjects.map((p) => {
              const owner = usersList.find((u) => u.id === p.user_id);
              return (
                <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-foreground/10 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Link href={`/admin/projects/${p.id}`} className="font-semibold text-sm hover:text-[#24b47e] transition-colors">
                      {p.name}
                    </Link>
                    <span className="text-xs text-gray-400 font-mono break-all max-w-[200px] sm:max-w-none">
                      Owner: {owner?.email || p.user_id}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-gray-200 dark:bg-gray-800 text-foreground font-semibold px-2 py-1 rounded font-mono">
                      {p.api_prefix}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentProjects.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">No projects exist yet.</p>
            )}
          </div>
        </div>

        {/* Recent Endpoints list */}
        <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Endpoints</h2>
            <Link href="/admin/endpoints" className="text-xs font-semibold text-[#24b47e] hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentEndpoints.map((ep) => {
              const proj = projects?.find((p) => p.id === ep.project_id);
              return (
                <div key={ep.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-foreground/10 transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        ep.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" :
                        ep.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {ep.method}
                      </span>
                      <Link href={`/admin/endpoints/${ep.id}`} className="font-mono text-xs font-semibold text-foreground hover:text-[#24b47e] transition-colors">
                        {ep.path}
                      </Link>
                    </div>
                    <span className="text-xs text-gray-400">
                      Project: {proj ? proj.name : "Unknown"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-500 font-mono">
                      Status: {ep.response_status}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(ep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentEndpoints.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">No endpoints exist yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
