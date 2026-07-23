import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { EndpointActionButton } from "./EndpointActionButton";
import { CopyCurlButton } from "./CopyCurlButton";
import { getSiteUrl } from "@/utils/site-url";

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

  async function deleteEndpoint(formData: FormData) {
    "use server";
    const endpointId = formData.get("endpoint_id") as string;
    const pid = formData.get("project_id") as string;
    const actionClient = await createClient(cookies());
    await actionClient.from("endpoints").delete().eq("id", endpointId);
    revalidatePath(`/dashboard/projects/${pid}`);
  }

  const endpointPath = `/api/mock/${project.api_prefix}`;
  const baseUrl = `${getSiteUrl()}${endpointPath}`;

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

      <div className="project-workspace project-workspace-ledger">
        <section className="endpoint-ledger" aria-labelledby="ledger-title">
          <div className="ledger-heading">
            <div>
              <p>CONFIGURED ROUTES</p>
              <h2 id="ledger-title">Endpoint ledger</h2>
            </div>
            <div className="ledger-heading-actions">
              <span>{endpoints?.length || 0} total</span>
              <Link
                className="button button-primary"
                href={`/dashboard/projects/${project.id}/endpoints/new`}
              >
                New endpoint
              </Link>
            </div>
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

                  <div className="endpoint-actions">
                    <div className="endpoint-quick-actions">
                      <a
                        className="endpoint-utility"
                        href={`${baseUrl}${endpoint.path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span aria-hidden="true">↗</span> Open endpoint
                      </a>
                      <CopyCurlButton
                        method={endpoint.method}
                        endpointUrl={`${baseUrl}${endpoint.path}`}
                        headers={endpoint.response_headers}
                        body={endpoint.response_body}
                      />
                      <Link
                        className="endpoint-utility"
                        href={`/dashboard/projects/${project.id}/endpoints/${endpoint.id}/edit`}
                      >
                        <span aria-hidden="true">✎</span> Edit route
                      </Link>
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
                      <EndpointActionButton
                        className="endpoint-delete-button"
                        pendingLabel="Deleting…"
                        confirmMessage={`Delete ${endpoint.method} ${endpoint.path}? This action cannot be undone.`}
                      >
                        Delete route
                      </EndpointActionButton>
                    </form>
                  </div>
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
