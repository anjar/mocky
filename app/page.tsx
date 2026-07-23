import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ThemeToggle } from "@/components/ThemeToggle";

const capabilities = [
  ["Methods", "GET · POST · PUT · PATCH · DELETE · OPTIONS"],
  ["Response", "JSON body · headers · status code"],
  ["Network", "Configurable response delay"],
  ["Routing", "Nested and wildcard paths"],
];

export default async function Index() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";
    const supabase = await createClient(cookies());
    await supabase.auth.signOut();
    return redirect("/login");
  };

  const workspaceHref = user ? "/dashboard" : "/signup";
  const workspaceLabel = user ? "Open dashboard" : "Create account";

  return (
    <div className="landing-shell">
      <header className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" href="/" aria-label="Mocky home">
          <span aria-hidden="true">M/</span> Mocky
        </Link>
        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <span className="account-label">{user.email}</span>
              <form action={signOut}>
                <button className="button button-quiet" type="submit">
                  Sign out
                </button>
              </form>
              <Link className="button button-primary" href="/dashboard">
                Open dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="button button-quiet" href="/login">
                Sign in
              </Link>
              <Link className="button button-primary" href="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero page-grid" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="signal-label">
              <span className="signal-dot" aria-hidden="true" />
              Simple mocking API
            </p>
            <h1 id="hero-title">Mock the endpoint. Keep building.</h1>
            <p className="hero-lede">
              Define routes, status codes, headers, JSON, and response delays.
              Give every developer a dependable API before the backend is ready.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary button-large" href={workspaceHref}>
                {workspaceLabel}
              </Link>
              <a className="text-link" href="#workbench">
                Inspect the workbench <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <figure className="request-panel" aria-label="Example mock API request and response">
            <div className="panel-heading">
              <span>REQUEST / RESPONSE</span>
              <span className="status"><i aria-hidden="true" />200 OK</span>
            </div>
            <div className="request-line">
              <span className="method">GET</span>
              <code>/api/mock/checkout</code>
            </div>
            <div className="code-block">
              <div><span className="code-key">&quot;status&quot;</span><span>: </span><span className="code-string">&quot;ready&quot;</span>,</div>
              <div><span className="code-key">&quot;items&quot;</span><span>: </span><span className="code-number">3</span>,</div>
              <div><span className="code-key">&quot;delay&quot;</span><span>: </span><span className="code-number">420</span></div>
            </div>
            <figcaption>
              <span>application/json</span>
              <span>420 ms simulated</span>
            </figcaption>
          </figure>
        </section>

        <section className="workbench" id="workbench" aria-labelledby="workbench-title">
          <div className="section-intro page-grid">
            <div>
              <p className="section-index">THE WORKBENCH</p>
              <h2 id="workbench-title">A predictable API in three moves.</h2>
            </div>
            <p>
              Configure only what the client needs. Mocky handles the route and
              serves the response from one stable URL.
            </p>
          </div>

          <ol className="workflow page-grid">
            <li>
              <span className="step-number">01</span>
              <div>
                <h3>Name the route</h3>
                <p>Choose the HTTP method and path your application expects.</p>
              </div>
              <code>POST /orders/:id</code>
            </li>
            <li>
              <span className="step-number">02</span>
              <div>
                <h3>Shape the response</h3>
                <p>Set headers, status, JSON body, and an optional network delay.</p>
              </div>
              <code>201 · 800 ms</code>
            </li>
            <li>
              <span className="step-number">03</span>
              <div>
                <h3>Connect the client</h3>
                <p>Copy the generated URL and continue building against it.</p>
              </div>
              <code>copy endpoint ↗</code>
            </li>
          </ol>
        </section>

        <section className="capabilities page-grid" aria-labelledby="capabilities-title">
          <div className="capability-heading">
            <p className="section-index">CAPABILITIES</p>
            <h2 id="capabilities-title">Small surface. Useful controls.</h2>
          </div>
          <dl className="spec-list">
            {capabilities.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="final-cta page-grid" aria-labelledby="cta-title">
          <div>
            <p className="section-index">READY WHEN YOU ARE</p>
            <h2 id="cta-title">Your frontend does not need to wait.</h2>
          </div>
          <Link className="button button-inverse button-large" href={workspaceHref}>
            {workspaceLabel}
          </Link>
        </section>
      </main>

      <footer className="site-footer">
        <p className="footer-mark">Mocky / Simple Mocking API</p>
        <p>Built for frontend, QA, and backend workflows.</p>
        <p>Next.js · Supabase</p>
      </footer>
    </div>
  );
}
