import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { EndpointActionButton } from "../../../EndpointActionButton";

const commonStatusCodes = [
  [200, "OK"],
  [201, "Created"],
  [204, "No Content"],
  [400, "Bad Request"],
  [401, "Unauthorized"],
  [403, "Forbidden"],
  [404, "Not Found"],
  [409, "Conflict"],
  [422, "Unprocessable Content"],
  [429, "Too Many Requests"],
  [500, "Internal Server Error"],
  [502, "Bad Gateway"],
  [503, "Service Unavailable"],
] as const;

export default async function EditEndpointPage({
  params,
}: {
  params: Promise<{ id: string; endpointId: string }>;
}) {
  const { id: projectId, endpointId } = await params;
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: project }, { data: endpoint }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).single(),
    supabase
      .from("endpoints")
      .select("*")
      .eq("id", endpointId)
      .eq("project_id", projectId)
      .single(),
  ]);

  if (!project || !endpoint) return notFound();

  async function updateEndpoint(formData: FormData) {
    "use server";

    const pid = formData.get("project_id") as string;
    const eid = formData.get("endpoint_id") as string;
    const response_status =
      parseInt(formData.get("response_status") as string) || 200;
    const delay_ms = parseInt(formData.get("delay_ms") as string) || 0;
    const response_headers = formData.get("response_headers") as string;
    const response_body = formData.get("response_body") as string;

    try {
      const headers = response_headers ? JSON.parse(response_headers) : {};
      const body = response_body ? JSON.parse(response_body) : {};
      const actionClient = await createClient(cookies());
      const { error } = await actionClient
        .from("endpoints")
        .update({
          response_status,
          delay_ms,
          response_headers: headers,
          response_body: body,
        })
        .eq("id", eid)
        .eq("project_id", pid);

      if (error) {
        console.error("Error updating endpoint:", error);
        return;
      }
    } catch (error) {
      console.error("Invalid JSON for headers or body", error);
      return;
    }

    revalidatePath(`/dashboard/projects/${pid}`);
    redirect(`/dashboard/projects/${pid}`);
  }

  return (
    <div className="endpoint-edit-page">
      <nav className="project-breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Projects</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/dashboard/projects/${project.id}`}>{project.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Edit route</span>
      </nav>

      <header className="edit-page-heading">
        <div>
          <p className="project-kicker">EDIT ENDPOINT</p>
          <h1>{endpoint.method} {endpoint.path}</h1>
        </div>
        <Link className="button button-quiet" href={`/dashboard/projects/${project.id}`}>
          Cancel
        </Link>
      </header>

      <form action={updateEndpoint} className="endpoint-edit-page-form">
        <input type="hidden" name="endpoint_id" value={endpoint.id} />
        <input type="hidden" name="project_id" value={project.id} />

        <div className="locked-route" aria-label="Route identity cannot be changed">
          <div>
            <span>Method</span>
            <strong>{endpoint.method}</strong>
          </div>
          <div>
            <span>Path</span>
            <code>{endpoint.path}</code>
          </div>
          <p>Method and path are fixed after an endpoint is created.</p>
        </div>

        <div className="field-grid field-grid-equal">
          <label className="field">
            <span>Status code</span>
            <select
              name="response_status"
              required
              defaultValue={endpoint.response_status}
            >
              {!commonStatusCodes.some(
                ([code]) => code === endpoint.response_status,
              ) && (
                <option value={endpoint.response_status}>
                  {endpoint.response_status} — Current value
                </option>
              )}
              {commonStatusCodes.map(([code, label]) => (
                <option value={code} key={code}>
                  {code} — {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Delay, ms</span>
            <input
              type="number"
              name="delay_ms"
              min="0"
              defaultValue={endpoint.delay_ms}
            />
          </label>
        </div>

        <label className="field">
          <span>Response body · JSON</span>
          <textarea
            name="response_body"
            rows={11}
            spellCheck="false"
            defaultValue={JSON.stringify(endpoint.response_body, null, 2)}
          />
          <small>Must be valid JSON.</small>
        </label>

        <label className="field">
          <span>Response headers · JSON</span>
          <textarea
            name="response_headers"
            rows={6}
            spellCheck="false"
            defaultValue={JSON.stringify(endpoint.response_headers || {}, null, 2)}
          />
        </label>

        <div className="edit-page-actions">
          <Link className="button button-quiet" href={`/dashboard/projects/${project.id}`}>
            Cancel
          </Link>
          <EndpointActionButton className="endpoint-save" pendingLabel="Saving…">
            Save changes
          </EndpointActionButton>
        </div>
      </form>
    </div>
  );
}
