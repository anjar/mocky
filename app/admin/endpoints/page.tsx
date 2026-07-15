import { cookies } from "next/headers";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminEndpointsList() {
  const supabase = await createAdminClient(cookies());

  // Fetch all endpoints across all projects
  const { data: endpoints, error: endpointsError } = await supabase
    .from("endpoints")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all projects to obtain their names
  const { data: projects } = await supabase.from("projects").select("id, name, api_prefix");

  const endpointsWithMeta = (endpoints || []).map((ep) => {
    const parentProject = projects?.find((p) => p.id === ep.project_id);
    return {
      ...ep,
      projectName: parentProject ? parentProject.name : "Unknown Project",
      apiPrefix: parentProject ? parentProject.api_prefix : "unknown",
    };
  });

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Platform Endpoints</h1>
          <p className="text-gray-500 text-sm">
            Overview and access of all mock API endpoints across all projects.
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground">
          Total Endpoints: {endpointsWithMeta.length}
        </div>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/10 bg-gray-50/50 dark:bg-gray-800/20 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6">Method / Path</th>
                <th className="py-4 px-6">Project Name</th>
                <th className="py-4 px-6 text-center">Status Code</th>
                <th className="py-4 px-6 text-center">Delay (ms)</th>
                <th className="py-4 px-6">Expiry</th>
                <th className="py-4 px-6">Created At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-sm">
              {endpointsWithMeta.map((ep) => (
                <tr key={ep.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        ep.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                        ep.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                        ep.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-semibold break-all max-w-[200px] md:max-w-none text-foreground">
                        {ep.path}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-foreground">
                    <Link
                      href={`/admin/projects/${ep.project_id}`}
                      className="hover:text-[#24b47e] transition-colors hover:underline text-sm font-semibold"
                    >
                      {ep.projectName}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-foreground font-mono text-xs">
                    {ep.response_status}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 font-mono text-xs">
                    {ep.delay_ms} ms
                  </td>
                  <td className="py-4 px-6 text-orange-600 dark:text-orange-400 font-mono text-xs font-medium">
                    {ep.expires_at ? new Date(ep.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">
                    {new Date(ep.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/endpoints/${ep.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#24b47e] hover:text-[#20a070] transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-md border border-foreground/5"
                    >
                      Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {endpointsWithMeta.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No mock endpoints found in this database.
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
