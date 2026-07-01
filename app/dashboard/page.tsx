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
    <div className="flex flex-col gap-12 w-full">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-3xl font-bold">Projects</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Project Card */}
        <div className="border border-foreground/10 rounded-lg p-6 bg-background shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <form action={createProject} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              required
              className="p-2 border border-foreground/20 rounded-md bg-transparent"
            />
            <input
              type="text"
              name="description"
              placeholder="Description (optional)"
              className="p-2 border border-foreground/20 rounded-md bg-transparent"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity mt-2"
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
            className="border border-foreground/10 rounded-lg p-6 bg-background shadow-sm hover:shadow-md transition-all hover:border-foreground/30 flex flex-col group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">{project.name}</h2>
            <p className="text-foreground/70 text-sm mb-4 flex-1">
              {project.description || 'No description provided.'}
            </p>
            <div className="text-xs bg-foreground/5 p-2 rounded font-mono text-foreground/80 break-all">
              Prefix: {project.api_prefix}
            </div>
            <div className="mt-4 text-sm font-medium text-blue-500">
              Manage Endpoints &rarr;
            </div>
          </Link>
        ))}

        {(!projects || projects.length === 0) && (
          <div className="flex items-center justify-center border border-dashed border-foreground/20 rounded-lg p-6 col-span-1 md:col-span-2 text-foreground/50">
            You don't have any projects yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
