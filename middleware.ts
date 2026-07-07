
export const config = {
  matcher: ['/agent/:path*', '/voice/:path*'],
};

// NOTE: keeping `grand-rounds-backend.onrender.com` until/unless we rename
// the Render service. Renaming breaks the public hostname.
const BACKEND_URL = 'https://grand-rounds-backend.onrender.com';

export default async function middleware(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const target = BACKEND_URL + incoming.pathname + incoming.search;

  const headers = new Headers(request.headers);
  const secret = process.env.BACKEND_SHARED_SECRET;
  if (secret) {
    headers.set('x-medkit-auth', secret);
  }
  // host must match the target, not the Vercel edge.
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  return fetch(target, init);
}
