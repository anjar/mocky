import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers";
import DashboardClient from './DashboardClient';
import { getSiteUrl } from '@/utils/site-url';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Projects | Mocky",
};

export default async function DashboardIndex() {
  const supabase = await createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Handled by layout redirect
  }

  // Fetch projects with their nested endpoints to compute active mock statistics
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      endpoints (
        id,
        method,
        path
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <DashboardClient
      initialProjects={projects || []}
      userEmail={user.email || ''}
      siteUrl={getSiteUrl()}
    />
  );
}
