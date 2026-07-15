import { cookies } from "next/headers";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectsList() {
  const supabase = await createAdminClient(cookies());

  // Fetch all projects across all users
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all endpoints to match with projects
  const { data: endpoints } = await supabase.from("endpoints").select("id, project_id");

  // Fetch all users to obtain emails
  let usersList: any[] = [];
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (!usersError && users) {
      usersList = users;
    }
  } catch (err) {
    console.error("Error listing users for projects page:", err);
  }

  const projectsWithMeta = (projects || []).map((project) => {
    const projEndpoints = endpoints?.filter((ep) => ep.project_id === project.id) || [];
    const owner = usersList.find((u) => u.id === project.user_id);
    return {
      ...project,
      endpointsCount: projEndpoints.length,
      ownerEmail: owner?.email || project.user_id || "Unknown Owner",
    };
  });

  return (
    <div className="flex flex-col gap-8 animate-in opacity-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Platform Projects</h1>
          <p className="text-gray-500 text-sm">
            Overview and access of all projects and workspaces configured on Mocky.
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground">
          Total Projects: {projectsWithMeta.length}
        </div>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-foreground/10 bg-gray-50/50 dark:bg-gray-800/20 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6">Project Name</th>
                <th className="py-4 px-6">API Prefix</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6 text-center">Endpoints</th>
                <th className="py-4 px-6">Created At</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10 text-sm">
              {projectsWithMeta.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="py-4 px-6 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{project.name}</span>
                      {project.description && (
                        <span className="text-xs text-gray-400 font-normal line-clamp-1 mt-0.5 max-w-[250px]">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-foreground">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-semibold">
                      {project.api_prefix}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-500 break-all max-w-[180px]">
                    <Link
                      href={`/admin/users/${project.user_id}`}
                      className="hover:text-[#24b47e] transition-colors hover:underline"
                    >
                      {project.ownerEmail}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-foreground">
                    {project.endpointsCount}
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">
                    {new Date(project.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#24b47e] hover:text-[#20a070] transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 px-3 py-1.5 rounded-md border border-foreground/5"
                    >
                      Details &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {projectsWithMeta.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No projects found in this database.
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
