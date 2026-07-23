"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EndpointActionButton } from "../../EndpointActionButton";

const statusCodes = [
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

type NewEndpointWorkbenchProps = {
  action: (formData: FormData) => Promise<void>;
  project: {
    id: string;
    name: string;
    api_prefix: string;
  };
};

export function NewEndpointWorkbench({
  action,
  project,
}: NewEndpointWorkbenchProps) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/users/1");
  const [status, setStatus] = useState("200");
  const [delay, setDelay] = useState("0");
  const [expiry, setExpiry] = useState("7");
  const [body, setBody] = useState('{\n  "message": "success"\n}');
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json"\n}',
  );

  const parsedBody = useMemo(() => {
    try {
      return { value: JSON.parse(body), error: null };
    } catch {
      return { value: null, error: "Response body is not valid JSON." };
    }
  }, [body]);

  const headersValid = useMemo(() => {
    try {
      JSON.parse(headers);
      return true;
    } catch {
      return false;
    }
  }, [headers]);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const formValid = !parsedBody.error && headersValid && path.trim().length > 0;

  return (
    <div className="new-endpoint-page">
      <nav className="project-breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Projects</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/dashboard/projects/${project.id}`}>{project.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">New endpoint</span>
      </nav>

      <header className="edit-page-heading">
        <div>
          <p className="project-kicker">NEW ENDPOINT</p>
          <h1>Compose a mock response</h1>
        </div>
        <Link className="button button-quiet" href={`/dashboard/projects/${project.id}`}>
          Cancel
        </Link>
      </header>

      <div className="new-endpoint-workbench">
        <form action={action} className="new-endpoint-form">
          <input type="hidden" name="project_id" value={project.id} />

          <div className="field-grid">
            <label className="field field-method">
              <span>Method</span>
              <select
                name="method"
                required
                value={method}
                onChange={(event) => setMethod(event.target.value)}
              >
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
                required
                value={path}
                onChange={(event) => setPath(event.target.value)}
              />
            </label>
          </div>

          <div className="field-grid field-grid-equal">
            <label className="field">
              <span>Status code</span>
              <select
                name="response_status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statusCodes.map(([code, label]) => (
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
                value={delay}
                onChange={(event) => setDelay(event.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Expires after</span>
            <select
              name="expires_in_days"
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </label>

          <label className="field">
            <span>Response body · JSON</span>
            <textarea
              name="response_body"
              rows={10}
              spellCheck="false"
              value={body}
              aria-invalid={Boolean(parsedBody.error)}
              onChange={(event) => setBody(event.target.value)}
            />
            <small className={parsedBody.error ? "field-error" : undefined}>
              {parsedBody.error || "Valid JSON response."}
            </small>
          </label>

          <label className="field">
            <span>Response headers · JSON</span>
            <textarea
              name="response_headers"
              rows={5}
              spellCheck="false"
              value={headers}
              aria-invalid={!headersValid}
              onChange={(event) => setHeaders(event.target.value)}
            />
            <small className={!headersValid ? "field-error" : undefined}>
              {headersValid ? "Valid JSON headers." : "Headers are not valid JSON."}
            </small>
          </label>

          <div className="edit-page-actions">
            <Link className="button button-quiet" href={`/dashboard/projects/${project.id}`}>
              Cancel
            </Link>
            <EndpointActionButton
              className="endpoint-save"
              disabled={!formValid}
              pendingLabel="Creating…"
            >
              Create endpoint
            </EndpointActionButton>
          </div>
          {!formValid && (
            <p className="form-error-summary" role="alert">
              Fix the JSON fields before creating this endpoint.
            </p>
          )}
        </form>

        <aside className="live-preview" aria-label="Live endpoint preview">
          <div className="live-preview-heading">
            <div>
              <p>LIVE PREVIEW</p>
              <h2>Response contract</h2>
            </div>
            <span>{status}</span>
          </div>
          <div className="preview-route">
            <span>{method}</span>
            <code>/api/mock/{project.api_prefix}{normalizedPath}</code>
          </div>
          <dl className="preview-meta">
            <div><dt>Status</dt><dd>{status}</dd></div>
            <div><dt>Delay</dt><dd>{delay || 0} ms</dd></div>
            <div><dt>Expires</dt><dd>{expiry} days</dd></div>
          </dl>
          <div className="preview-json">
            <div>
              <span>RESPONSE BODY</span>
              <span>application/json</span>
            </div>
            <pre>
              {parsedBody.error
                ? parsedBody.error
                : JSON.stringify(parsedBody.value, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
