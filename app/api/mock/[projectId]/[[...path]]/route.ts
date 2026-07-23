import { createClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

type RouteContext = { params: Promise<{ projectId: string; path?: string[] }> };

async function handleMockRequest(request: NextRequest, { params }: RouteContext) {
  // Await the params to resolve Next.js 15+ routing requirements
  const resolvedParams = await params;
  const apiPrefix = resolvedParams.projectId;
  const pathArray = resolvedParams.path || [];
  const requestPath = '/' + pathArray.join('/');
  const method = request.method;

  // Use Service Role key to bypass RLS for the public mock endpoint
  // We fall back to anon key if service role is missing, but RLS will block it.
  // In a real prod setup, SUPABASE_SERVICE_ROLE_KEY MUST be set in .env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  console.log("apiPrefix", apiPrefix, "patjh", pathArray)

  // 1. Find the project by api_prefix
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('api_prefix', apiPrefix)
    .single();

  console.log("project", project)
  if (!project) {
    return NextResponse.json(
      { error: `Mocky: Project with prefix '${apiPrefix}' not found.` },
      { status: 404 }
    );
  }

  // 2. Find the endpoint
  const { data: endpoint } = await supabase
    .from('endpoints')
    .select('*')
    .eq('project_id', project.id)
    .eq('method', method === 'OPTIONS' ? 'GET' : method) // fallback for checking existence in options
    .eq('path', requestPath)
    .maybeSingle();

  if (!endpoint && method !== 'OPTIONS') {
    return NextResponse.json(
      { error: `Mocky: Endpoint '${method} ${requestPath}' not found in this project.` },
      { status: 404 }
    );
  } else if (!endpoint && method === 'OPTIONS') {
    return new NextResponse(null, { status: 404 });
  }

  // 3. Apply artificial delay if configured
  if (endpoint.delay_ms && endpoint.delay_ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, endpoint.delay_ms));
  }

  // 4. Construct response headers
  const headers = new Headers();
  if (endpoint.response_headers) {
    Object.entries(endpoint.response_headers).forEach(([key, value]) => {
      headers.set(key, String(value));
    });
  }

  // Add CORS headers for OPTIONS requests
  if (method === 'OPTIONS') {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return new NextResponse(null, { status: 204, headers });
  }

  // Ensure we have a content-type if returning JSON body, and one wasn't explicitly set
  if (!headers.has('content-type') && typeof endpoint.response_body === 'object') {
    headers.set('content-type', 'application/json');
  }

  // 5. Return the mock response
  let responseBody = endpoint.response_body;
  if (typeof responseBody !== 'string') {
    responseBody = JSON.stringify(responseBody);
  }

  return new NextResponse(responseBody, {
    status: endpoint.response_status,
    headers,
  });
}

// Export handlers for all common HTTP methods
export async function GET(req: NextRequest, context: RouteContext) {
  return handleMockRequest(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handleMockRequest(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handleMockRequest(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handleMockRequest(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handleMockRequest(req, context);
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  const response = await handleMockRequest(req, context);
  if (response.status === 404) {
    // If we couldn't find an endpoint to base OPTIONS on, return generic CORS
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
  return response;
}
