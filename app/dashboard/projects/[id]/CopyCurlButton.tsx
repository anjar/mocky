"use client";

import { useEffect, useState } from "react";

type CopyCurlButtonProps = {
  method: string;
  endpointUrl: string;
  headers: Record<string, unknown> | null;
  body: unknown;
};

function shellQuote(value: string) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function CopyCurlButton({
  method,
  endpointUrl,
  headers,
  body,
}: CopyCurlButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyCurl = async () => {
    const url = new URL(endpointUrl, window.location.origin).toString();
    const parts = [`curl -X ${method}`, shellQuote(url)];

    Object.entries(headers || {}).forEach(([name, value]) => {
      parts.push("-H", shellQuote(`${name}: ${String(value)}`));
    });

    if (method !== "GET" && method !== "HEAD" && body != null) {
      parts.push("--data-raw", shellQuote(JSON.stringify(body)));
    }

    await navigator.clipboard.writeText(parts.join(" "));
    setCopied(true);
  };

  return (
    <button
      type="button"
      className="endpoint-utility"
      onClick={copyCurl}
      aria-live="polite"
    >
      <span aria-hidden="true">{copied ? "✓" : "›_"}</span>
      {copied ? "cURL copied" : "Copy cURL"}
    </button>
  );
}
