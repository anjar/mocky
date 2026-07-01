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
    <div className="flex flex-col gap-8 w-full pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span>{project.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{project.name} Endpoints</h1>
        <p className="text-foreground/80">
          Base URL: <code className="bg-foreground/10 px-2 py-1 rounded text-sm font-mono">https://yourdomain.com/api/mock/{project.api_prefix}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Endpoint Form */}
        <div className="lg:col-span-1 border border-foreground/10 rounded-lg p-6 bg-background h-fit">
          <h2 className="text-xl font-semibold mb-6">New Endpoint</h2>
          <form action={createEndpoint} className="flex flex-col gap-4 text-sm">
            <input type="hidden" name="project_id" value={project.id} />

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Method</label>
              <select name="method" className="p-2 border border-foreground/20 rounded-md bg-transparent" required>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Path</label>
              <input type="text" name="path" placeholder="/users/1" required className="p-2 border border-foreground/20 rounded-md bg-transparent font-mono" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Response Status Code</label>
              <input type="number" name="response_status" defaultValue="200" required className="p-2 border border-foreground/20 rounded-md bg-transparent font-mono" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Delay (ms)</label>
              <input type="number" name="delay_ms" defaultValue="0" className="p-2 border border-foreground/20 rounded-md bg-transparent font-mono" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Response Body (JSON)</label>
              <textarea name="response_body" rows={4} defaultValue='{"message": "success"}' className="p-2 border border-foreground/20 rounded-md bg-transparent font-mono text-xs"></textarea>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-foreground/80">Response Headers (JSON)</label>
              <textarea name="response_headers" rows={2} defaultValue='{"Content-Type": "application/json"}' className="p-2 border border-foreground/20 rounded-md bg-transparent font-mono text-xs"></textarea>
            </div>

            <button type="submit" className="py-2 px-4 mt-4 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity">
              Create Endpoint
            </button>
          </form>
        </div>

        {/* Endpoints List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">Configured Endpoints</h2>

          {endpoints?.map((endpoint) => (
            <div key={endpoint.id} className="border border-foreground/10 rounded-lg p-6 bg-background flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono font-medium">{endpoint.path}</span>
                </div>
                <form action={deleteEndpoint}>
                  <input type="hidden" name="endpoint_id" value={endpoint.id} />
                  <input type="hidden" name="project_id" value={project.id} />
                  <button type="submit" className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </form>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div>
                  <span className="text-foreground/60 text-xs uppercase tracking-wider block mb-1">Status</span>
                  <span className="font-mono bg-foreground/5 px-2 py-1 rounded">{endpoint.response_status}</span>
                </div>
                <div>
                  <span className="text-foreground/60 text-xs uppercase tracking-wider block mb-1">Delay</span>
                  <span className="font-mono bg-foreground/5 px-2 py-1 rounded">{endpoint.delay_ms} ms</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-foreground/60 text-xs uppercase tracking-wider block mb-1">Response Body</span>
                <pre className="bg-foreground/5 p-3 rounded-md text-xs font-mono overflow-x-auto">
                  {JSON.stringify(endpoint.response_body, null, 2)}
                </pre>
              </div>
            </div>
          ))}

          {(!endpoints || endpoints.length === 0) && (
            <div className="flex flex-col items-center justify-center border border-dashed border-foreground/20 rounded-lg p-12 text-center text-foreground/50 gap-2">
              <p>No endpoints configured for this project.</p>
              <p className="text-sm">Use the form to create your first mocked API endpoint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
