import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function DashboardIndex() {
  const supabase = await createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Handled by layout redirect
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  async function createProject(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    // Generate a random prefix for the API url
    const apiPrefix = `pr_${Math.random().toString(36).substring(2, 10)}`;

    const supabase = await createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('projects').insert({
      name,
      description,
      api_prefix: apiPrefix,
      user_id: user.id
    });

    if (error) {
      console.error('Error creating project:', error);
    }

    revalidatePath('/dashboard');
  }

  return (
    <div className="flex flex-col gap-10 w-full animate-in opacity-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-gray-500 text-sm">Manage your API mock projects and endpoints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Project Card */}
        <div className="border border-gray-300 rounded-lg p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Create New Project</h2>
          <form action={createProject} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500" htmlFor="name">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="My awesome project"
                required
                className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-500" htmlFor="description">
                Description (optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="What is this project for?"
                className="rounded-md px-4 py-2 bg-inherit border border-gray-300 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              className="bg-[#24b47e] rounded-md px-4 py-2.5 text-white text-sm font-medium hover:bg-[#20a070] transition-colors mt-2"
            >
              Create Project
            </button>
          </form>
        </div>

        {/* List Projects */}
        {projects?.map((project) => (
          <Link
            href={`/dashboard/projects/${project.id}`}
            key={project.id}
            className="border border-gray-300 rounded-lg p-6 bg-background shadow-sm hover:shadow-md hover:border-[#24b47e] transition-all flex flex-col group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-[#24b47e] transition-colors">{project.name}</h2>
            <p className="text-gray-500 text-sm mb-4 flex-1">
              {project.description || 'No description provided.'}
            </p>
            <div className="text-xs bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md font-mono text-gray-600 dark:text-gray-300 break-all border border-gray-100 dark:border-gray-800">
              <span className="text-gray-400">Prefix:</span> <span className="font-semibold text-foreground">{project.api_prefix}</span>
            </div>
            <div className="mt-4 text-sm font-medium text-[#24b47e] flex items-center transition-transform transform group-hover:translate-x-1 w-max">
              Manage Endpoints &rarr;
            </div>
          </Link>
        ))}

        {(!projects || projects.length === 0) && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 col-span-1 md:col-span-2 text-gray-500 bg-gray-50/50 min-h-[250px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <p className="font-medium">You don't have any projects yet.</p>
            <p className="text-sm mt-1">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
