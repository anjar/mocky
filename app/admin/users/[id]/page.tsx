import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const supabase = await createAdminClient(cookies());

  // Fetch the specific user using admin auth API
  let selectedUser: any = null;
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      selectedUser = data.user;
    }
  } catch (err) {
    console.error("Error fetching user detail:", err);
  }

  if (!selectedUser) {
    return notFound();
  }

  // Fetch projects belonging to this user
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Fetch endpoints for projects belonging to this user
  const projectIds = projects?.map((p) => p.id) || [];
  let endpoints: any[] = [];
  if (projectIds.length > 0) {
    const { data: eps } = await supabase
      .from("endpoints")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });
    if (eps) {
      endpoints = eps;
    }
  }

  const isUserAdmin =
    selectedUser.user_metadata?.role === "is_admin" ||
    selectedUser.user_metadata?.is_admin === true ||
    selectedUser.app_metadata?.role === "is_admin" ||
    selectedUser.app_metadata?.is_admin === true;

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-foreground transition-colors">Users</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{selectedUser.email}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-foreground/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight break-all">
            {selectedUser.email}
          </h1>
          <p className="text-sm text-gray-500 font-mono text-[11px] mt-1 break-all">
            User ID: {selectedUser.id}
          </p>
        </div>
        <div>
          {isUserAdmin ? (
            <span className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border border-red-200 dark:border-red-900/10 shadow-sm">
              Administrator
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/5 shadow-sm">
              Standard Account
            </span>
          )}
        </div>
      </div>

      {/* Grid: User Profile Details + Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Profile details & Metadata */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground">User Information</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</span>
                <span className="font-medium break-all">{selectedUser.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Created Date</span>
                <span className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Sign-In</span>
                <span className="font-medium">
                  {selectedUser.last_sign_in_at
                    ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                    : "Never signed in"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Auth Provider</span>
                <span className="font-medium font-mono text-xs">{selectedUser.app_metadata?.provider || "Email"}</span>
              </div>
            </div>
          </div>

          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground">Raw Metadata</h2>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">App Metadata</span>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto font-mono text-[10px] text-foreground border border-gray-100 dark:border-gray-800">
                  {JSON.stringify(selectedUser.app_metadata, null, 2)}
                </pre>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">User Metadata</span>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto font-mono text-[10px] text-foreground border border-gray-100 dark:border-gray-800">
                  {JSON.stringify(selectedUser.user_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: User projects and endpoints */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Projects lists */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">User's Projects ({projects?.length || 0})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects?.map((project) => {
                const projectEndpoints = endpoints.filter((ep) => ep.project_id === project.id);
                return (
                  <Link
                    href={`/admin/projects/${project.id}`}
                    key={project.id}
                    className="border border-foreground/10 rounded-xl p-5 bg-card shadow-sm hover:shadow-md hover:border-[#24b47e] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <h3 className="font-bold text-base mb-1.5 group-hover:text-[#24b47e] transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-foreground/5 text-xs text-gray-400 font-medium">
                      <span>Prefix: <code className="font-mono text-foreground font-semibold">{project.api_prefix}</code></span>
                      <span className="bg-gray-100 dark:bg-gray-800 text-foreground px-2 py-1 rounded font-mono font-semibold">
                        {projectEndpoints.length} EPs
                      </span>
                    </div>
                  </Link>
                );
              })}
              {(!projects || projects.length === 0) && (
                <div className="col-span-1 md:col-span-2 text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 bg-gray-50/50">
                  This user has not created any projects yet.
                </div>
              )}
            </div>
          </div>

          {/* Endpoints lists */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Endpoints Across Projects ({endpoints.length})</h2>
            <div className="flex flex-col gap-3">
              {endpoints.map((ep) => {
                const epProject = projects?.find((p) => p.id === ep.project_id);
                return (
                  <div
                    key={ep.id}
                    className="border border-foreground/10 rounded-xl p-5 bg-card flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                          ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          ep.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                          ep.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                          ep.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {ep.method}
                        </span>
                        <Link href={`/admin/endpoints/${ep.id}`} className="font-mono text-sm font-semibold hover:text-[#24b47e] transition-colors break-all">
                          {ep.path}
                        </Link>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        Project: <span className="text-foreground font-semibold">{epProject ? epProject.name : "Unknown"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>Status Code: <strong className="text-foreground">{ep.response_status}</strong></span>
                      <span>Delay: <strong className="text-foreground">{ep.delay_ms} ms</strong></span>
                      <span>Created: <strong className="text-foreground">{new Date(ep.created_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                );
              })}
              {endpoints.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 bg-gray-50/50">
                  No endpoints configured under this user's projects.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
