import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const supabase = await createAdminClient(cookies());

  // Fetch the project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    return notFound();
  }

  // Fetch all endpoints under this project
  const { data: endpoints } = await supabase
    .from("endpoints")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Fetch project owner details from auth
  let owner: any = null;
  try {
    const { data, error } = await supabase.auth.admin.getUserById(project.user_id);
    if (!error && data?.user) {
      owner = data.user;
    }
  } catch (err) {
    console.error("Error fetching project owner details for admin:", err);
  }

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/projects" className="hover:text-foreground transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{project.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-foreground/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            API Prefix: <code className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-foreground font-mono font-semibold">{project.api_prefix}</code>
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold px-4 py-2 rounded-lg border border-foreground/10 text-foreground">
          Endpoints: {endpoints?.length || 0}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: project metadata & owner */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Project Details</h2>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Project ID</span>
                <span className="font-mono text-xs text-foreground break-all">{project.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</span>
                <span className="text-foreground">{project.description || "No description provided."}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Created At</span>
                <span className="text-foreground">{new Date(project.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Project Owner</h2>
            {owner ? (
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Owner Email</span>
                  <Link
                    href={`/admin/users/${owner.id}`}
                    className="font-medium text-[#24b47e] hover:underline break-all"
                  >
                    {owner.email}
                  </Link>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Owner User ID</span>
                  <span className="font-mono text-xs text-foreground break-all">{owner.id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Owner Joined</span>
                  <span className="text-foreground">{new Date(owner.created_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">User ID Reference</span>
                <span className="font-mono text-xs break-all">{project.user_id}</span>
                <span className="text-xs text-red-500 mt-2">Owner account not found in Auth system.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: endpoints catalog */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold">Endpoints Catalog ({endpoints?.length || 0})</h2>
          <div className="flex flex-col gap-4">
            {endpoints?.map((ep) => (
              <div
                key={ep.id}
                className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      ep.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                      ep.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                      ep.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {ep.method}
                    </span>
                    <Link
                      href={`/admin/endpoints/${ep.id}`}
                      className="font-mono font-bold text-sm text-foreground hover:text-[#24b47e] transition-colors break-all"
                    >
                      {ep.path}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    ID: {ep.id.substring(0, 8)}...
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-mono text-gray-500 border-t border-b border-foreground/5 py-3 mt-1 bg-gray-50/40 dark:bg-gray-800/20 px-3 rounded-lg">
                  <div>
                    <span className="text-gray-400 block mb-0.5 text-[10px] uppercase">Status Code</span>
                    <strong className="text-foreground">{ep.response_status}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 text-[10px] uppercase">Delay</span>
                    <strong className="text-foreground">{ep.delay_ms} ms</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 text-[10px] uppercase">Created At</span>
                    <strong className="text-foreground">{new Date(ep.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Response JSON Sample</span>
                  <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-xs font-mono overflow-x-auto text-foreground max-h-36">
                    {JSON.stringify(ep.response_body, null, 2)}
                  </pre>
                </div>
              </div>
            ))}

            {(!endpoints || endpoints.length === 0) && (
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 bg-gray-50/50">
                No mock endpoints configured inside this project workspace.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
