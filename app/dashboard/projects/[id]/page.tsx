import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) return notFound();

  const { data: endpoints } = await supabase
    .from("endpoints")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  async function createEndpoint(formData: FormData) {
    "use server";

    const method = formData.get("method") as string;
    let path = formData.get("path") as string;
    const response_status =
      parseInt(formData.get("response_status") as string) || 200;
    const response_headers = formData.get("response_headers") as string;
    const response_body = formData.get("response_body") as string;
    const delay_ms = parseInt(formData.get("delay_ms") as string) || 0;
    const pid = formData.get("project_id") as string;

    if (!path.startsWith("/")) path = `/${path}`;

    const actionClient = await createClient(cookies());

    try {
      const headers = response_headers ? JSON.parse(response_headers) : {};
      const body = response_body ? JSON.parse(response_body) : {};
      const { error } = await actionClient.from("endpoints").insert({
        project_id: pid,
        method,
        path,
        response_status,
        response_headers: headers,
        response_body: body,
        delay_ms,
      });

      if (error) console.error("Error creating endpoint:", error);
    } catch (error) {
      console.error("Invalid JSON for headers or body", error);
    }

    revalidatePath(`/dashboard/projects/${pid}`);
  }

  async function deleteEndpoint(formData: FormData) {
    "use server";
    const endpointId = formData.get("endpoint_id") as string;
    const pid = formData.get("project_id") as string;
    const actionClient = await createClient(cookies());
    await actionClient.from("endpoints").delete().eq("id", endpointId);
    revalidatePath(`/dashboard/projects/${pid}`);
  }

  const baseUrl = `/api/mock/${project.api_prefix}`;

  return (
    <div className="project-detail">
      <header className="project-heading">
        <nav className="project-breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Projects</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{project.name}</span>
        </nav>
        <div className="project-title-row">
          <div>
            <p className="project-kicker">PROJECT WORKBENCH</p>
            <h1>{project.name}</h1>
          </div>
          <div className="endpoint-count" aria-label={`${endpoints?.length || 0} endpoints`}>
            <strong>{String(endpoints?.length || 0).padStart(2, "0")}</strong>
            <span>endpoints</span>
          </div>
        </div>
        <div className="base-url">
          <span>BASE URL</span>
          <code>{baseUrl}</code>
        </div>
      </header>

      <div className="project-workspace">
        <aside className="endpoint-composer">
          <div className="composer-heading">
            <div>
              <p>NEW ENDPOINT</p>
              <h2>Compose a response</h2>
            </div>
            <span aria-hidden="true">+</span>
          </div>

          <form action={createEndpoint} className="endpoint-form">
            <input type="hidden" name="project_id" value={project.id} />

            <div className="field-grid">
              <label className="field field-method">
                <span>Method</span>
                <select name="method" required defaultValue="GET">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </label>
              <label className="field field-path">
                <span>Path</span>
                <input
                  type="text"
                  name="path"
                  placeholder="/users/1"
                  required
                />
              </label>
            </div>

            <div className="field-grid field-grid-equal">
              <label className="field">
                <span>Status code</span>
                <input
                  type="number"
                  name="response_status"
                  defaultValue="200"
                  min="100"
                  max="599"
                  required
                />
              </label>
              <label className="field">
                <span>Delay, ms</span>
                <input
                  type="number"
                  name="delay_ms"
                  defaultValue="0"
                  min="0"
                />
              </label>
            </div>

            <label className="field">
              <span>Response body · JSON</span>
              <textarea
                name="response_body"
                rows={7}
                defaultValue={'{\n  "message": "success"\n}'}
                spellCheck="false"
              />
              <small>Must be valid JSON.</small>
            </label>

            <label className="field">
              <span>Response headers · JSON</span>
              <textarea
                name="response_headers"
                rows={3}
                defaultValue={'{\n  "Content-Type": "application/json"\n}'}
                spellCheck="false"
              />
            </label>

            <button className="composer-submit" type="submit">
              Create endpoint <span aria-hidden="true">→</span>
            </button>
          </form>
        </aside>

        <section className="endpoint-ledger" aria-labelledby="ledger-title">
          <div className="ledger-heading">
            <div>
              <p>CONFIGURED ROUTES</p>
              <h2 id="ledger-title">Endpoint ledger</h2>
            </div>
            <span>{endpoints?.length || 0} total</span>
          </div>

          {endpoints && endpoints.length > 0 ? (
            <div className="endpoint-list">
              {endpoints.map((endpoint) => (
                <article className="endpoint-row" key={endpoint.id}>
                  <div className="endpoint-route">
                    <span className="method-badge">{endpoint.method}</span>
                    <code>{endpoint.path}</code>
                    <span className="route-status">
                      <i aria-hidden="true" />
                      active
                    </span>
                  </div>

                  <dl className="endpoint-meta">
                    <div>
                      <dt>Status</dt>
                      <dd>{endpoint.response_status}</dd>
                    </div>
                    <div>
                      <dt>Delay</dt>
                      <dd>{endpoint.delay_ms} ms</dd>
                    </div>
                    <div>
                      <dt>Expires</dt>
                      <dd>
                        {endpoint.expires_at
                          ? new Date(endpoint.expires_at).toLocaleDateString()
                          : "Never"}
                      </dd>
                    </div>
                  </dl>

                  <div className="endpoint-response">
                    <div className="response-label">
                      <span>RESPONSE BODY</span>
                      <span>application/json</span>
                    </div>
                    <pre>{JSON.stringify(endpoint.response_body, null, 2)}</pre>
                  </div>

                  <form action={deleteEndpoint} className="endpoint-delete">
                    <input
                      type="hidden"
                      name="endpoint_id"
                      value={endpoint.id}
                    />
                    <input
                      type="hidden"
                      name="project_id"
                      value={project.id}
                    />
                    <button type="submit" aria-label={`Delete ${endpoint.method} ${endpoint.path}`}>
                      Delete route
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="endpoint-empty">
              <span aria-hidden="true">{"{ }"}</span>
              <h3>No routes configured</h3>
              <p>
                Use the composer to create the first mock response for this project.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
