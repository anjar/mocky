import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminEndpointDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const endpointId = resolvedParams.id;

  const supabase = await createAdminClient(cookies());

  // Fetch specific endpoint configuration
  const { data: endpoint } = await supabase
    .from("endpoints")
    .select("*")
    .eq("id", endpointId)
    .single();

  if (!endpoint) {
    return notFound();
  }

  // Fetch parent project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", endpoint.project_id)
    .single();

  // Fetch owner details
  let owner: any = null;
  if (project) {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(project.user_id);
      if (!error && data?.user) {
        owner = data.user;
      }
    } catch (err) {
      console.error("Error fetching endpoint owner details:", err);
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0 pb-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/endpoints" className="hover:text-foreground transition-colors">Endpoints</Link>
        <span>/</span>
        <span className="text-foreground font-semibold font-mono text-xs">{endpoint.method} {endpoint.path}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-foreground/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md text-sm font-bold tracking-wider uppercase ${
              endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
              endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
              endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
              endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {endpoint.method}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-mono text-foreground break-all">
              {endpoint.path}
            </h1>
          </div>
          <p className="text-sm text-gray-500 font-mono text-[11px] mt-1 break-all">
            Endpoint ID: {endpoint.id}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="bg-gray-100 dark:bg-gray-800 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/10">
            Status: {endpoint.response_status}
          </span>
          <span className="bg-gray-100 dark:bg-gray-800 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/10">
            Delay: {endpoint.delay_ms} ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Relationship info & Expiry */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Metadata / Scope</h2>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Method</span>
                <span className="font-semibold text-foreground">{endpoint.method}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Created At</span>
                <span className="text-foreground">{new Date(endpoint.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Expires At</span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  {endpoint.expires_at ? new Date(endpoint.expires_at).toLocaleString() : "Never"}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Project Association</h2>
            {project ? (
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Project Name</span>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="font-bold text-[#24b47e] hover:underline"
                  >
                    {project.name}
                  </Link>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">API Prefix</span>
                  <code className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-foreground font-mono font-semibold text-xs w-max">{project.api_prefix}</code>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-500">
                Associated project was not found in database.
              </div>
            )}
          </div>

          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Account Owner</h2>
            {owner ? (
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Owner Email</span>
                  <Link
                    href={`/admin/users/${owner.id}`}
                    className="font-bold text-[#24b47e] hover:underline break-all"
                  >
                    {owner.email}
                  </Link>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Owner Joined</span>
                  <span className="text-foreground">{new Date(owner.created_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-500">
                Account owner details not found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: response_body and response_headers details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Configured Response Headers</h2>
            <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-xs font-mono overflow-x-auto text-foreground">
              {JSON.stringify(endpoint.response_headers || {}, null, 2)}
            </pre>
          </div>

          <div className="border border-foreground/10 rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold">Mock Response Body (JSON)</h2>
            <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-xs font-mono overflow-x-auto text-foreground min-h-[160px]">
              {JSON.stringify(endpoint.response_body || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
