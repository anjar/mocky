import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { NewEndpointWorkbench } from "./NewEndpointWorkbench";

export default async function NewEndpointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, api_prefix")
    .eq("id", projectId)
    .single();

  if (!project) return notFound();

  async function createEndpoint(formData: FormData) {
    "use server";

    const pid = formData.get("project_id") as string;
    const method = formData.get("method") as string;
    let path = formData.get("path") as string;
    const response_status =
      parseInt(formData.get("response_status") as string) || 200;
    const delay_ms = parseInt(formData.get("delay_ms") as string) || 0;
    const requestedExpiryDays =
      parseInt(formData.get("expires_in_days") as string) || 7;
    const expiryDays = [1, 7, 14, 30].includes(requestedExpiryDays)
      ? requestedExpiryDays
      : 7;
    const response_headers = formData.get("response_headers") as string;
    const response_body = formData.get("response_body") as string;

    if (!path.startsWith("/")) path = `/${path}`;

    let headers: Record<string, unknown>;
    let body: unknown;

    try {
      headers = response_headers ? JSON.parse(response_headers) : {};
      body = response_body ? JSON.parse(response_body) : {};
    } catch (error) {
      console.error("Invalid JSON for headers or body", error);
      return;
    }
    const expires_at = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const actionClient = await createClient(cookies());
    const { error } = await actionClient.from("endpoints").insert({
      project_id: pid,
      method,
      path,
      response_status,
      response_headers: headers,
      response_body: body,
      delay_ms,
      expires_at,
    });

    if (error) {
      console.error("Error creating endpoint:", error);
      return;
    }

    revalidatePath(`/dashboard/projects/${pid}`);
    redirect(`/dashboard/projects/${pid}`);
  }

  return (
    <NewEndpointWorkbench
      action={createEndpoint}
      project={project}
    />
  );
}
