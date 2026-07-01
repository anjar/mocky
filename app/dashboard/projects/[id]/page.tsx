import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Await the params to resolve Next.js 15+ routing requirements
  // Wait, this is Next.js 14 based on the starter version, so we can use params.id directly
  // Actually, wait, let's just use it safely.
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!project) {
    return notFound();
  }

  const { data: endpoints } = await supabase
    .from('endpoints')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  async function createEndpoint(formData: FormData) {
    'use server';

    const method = formData.get('method') as string;
    let path = formData.get('path') as string;
    const response_status = parseInt(formData.get('response_status') as string) || 200;
    const response_headers = formData.get('response_headers') as string;
    const response_body = formData.get('response_body') as string;
    const delay_ms = parseInt(formData.get('delay_ms') as string) || 0;
    const pid = formData.get('project_id') as string;

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    const supabase = await createClient(cookies());

    try {
      const headers = response_headers ? JSON.parse(response_headers) : {};
      const body = response_body ? JSON.parse(response_body) : {};

      const { error } = await supabase.from('endpoints').insert({
        project_id: pid,
        method,
        path,
        response_status,
        response_headers: headers,
        response_body: body,
        delay_ms
      });

      if (error) {
        console.error('Error creating endpoint:', error);
      }
    } catch (e) {
      console.error('Invalid JSON for headers or body', e);
    }

    revalidatePath(`/dashboard/projects/${pid}`);
  }

  async function deleteEndpoint(formData: FormData) {
    'use server';
    const endpointId = formData.get('endpoint_id') as string;
    const pid = formData.get('project_id') as string;

    const supabase = await createClient(cookies());
    await supabase.from('endpoints').delete().eq('id', endpointId);

    revalidatePath(`/dashboard/projects/${pid}`);
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-20 animate-in opacity-0">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground">{project.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{project.name} Endpoints</h1>
        <p className="text-gray-500 mt-1">
          Base URL: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm font-mono text-foreground border border-gray-200 dark:border-gray-700">https://yourdomain.com/api/mock/{project.api_prefix}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Endpoint Form */}
        <div className="lg:col-span-1 border border-gray-300 rounded-lg p-6 bg-background h-fit shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-foreground">New Endpoint</h2>
          <form action={createEndpoint} className="flex flex-col gap-4">
            <input type="hidden" name="project_id" value={project.id} />

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Method</label>
              <select name="method" className="rounded-md px-3 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500" required>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Path</label>
              <input type="text" name="path" placeholder="/users/1" required className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500 font-mono" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Response Status Code</label>
              <input type="number" name="response_status" defaultValue="200" required className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500 font-mono" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Delay (ms)</label>
              <input type="number" name="delay_ms" defaultValue="0" className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500 font-mono" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Response Body (JSON)</label>
              <textarea name="response_body" rows={4} defaultValue='{"message": "success"}' className="rounded-md px-4 py-3 bg-inherit border border-gray-300 text-xs focus:outline-none focus:border-gray-500 font-mono"></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500 font-medium">Response Headers (JSON)</label>
              <textarea name="response_headers" rows={2} defaultValue='{"Content-Type": "application/json"}' className="rounded-md px-4 py-3 bg-inherit border border-gray-300 text-xs focus:outline-none focus:border-gray-500 font-mono"></textarea>
            </div>

            <button type="submit" className="bg-[#24b47e] rounded-md px-4 py-2.5 text-white text-sm font-medium hover:bg-[#20a070] transition-colors mt-2 shadow-sm">
              Create Endpoint
            </button>
          </form>
        </div>

        {/* Endpoints List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Configured Endpoints</h2>

          {endpoints?.map((endpoint) => (
            <div key={endpoint.id} className="border border-gray-300 rounded-lg p-6 bg-background flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                      endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                      endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono font-medium text-foreground">{endpoint.path}</span>
                  </div>
                  {endpoint.expires_at && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Expires: {new Date(endpoint.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <form action={deleteEndpoint}>
                  <input type="hidden" name="endpoint_id" value={endpoint.id} />
                  <input type="hidden" name="project_id" value={project.id} />
                  <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete endpoint">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Status</span>
                  <span className="font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-md w-max text-foreground">{endpoint.response_status}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Delay</span>
                  <span className="font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded-md w-max text-foreground">{endpoint.delay_ms} ms</span>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-1.5">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Response Body</span>
                <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-xs font-mono overflow-x-auto text-foreground">
                  {JSON.stringify(endpoint.response_body, null, 2)}
                </pre>
              </div>
            </div>
          ))}

          {(!endpoints || endpoints.length === 0) && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500 gap-2 bg-gray-50/50 min-h-[300px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-40">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p className="font-medium text-lg text-foreground">No endpoints yet</p>
              <p className="text-sm">Use the form on the left to create your first mocked API endpoint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
