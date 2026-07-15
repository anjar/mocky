'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";
import { revalidatePath } from 'next/cache';

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  // Generate a random prefix for the API url
  const apiPrefix = `pr_${Math.random().toString(36).substring(2, 10)}`;

  const supabase = await createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('projects').insert({
    name,
    description: description || '',
    api_prefix: apiPrefix,
    user_id: user.id
  });

  if (error) {
    console.error('Error creating project:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
