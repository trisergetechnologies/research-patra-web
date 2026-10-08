import { exchangePreviewTicket } from '@/lib/api';
import { BASE_PATH, SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const OBJECT_ID = /^[a-f0-9]{24}$/i;

// Swaps the one-time ticket for a private cookie scoped to this preview, then drops the ticket from the URL.
export async function GET(request, { params }) {
  const { id } = await params;
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  if (!OBJECT_ID.test(id)) return new Response('Not found', { status: 404, headers });

  const page = `${BASE_PATH}/preview/${id}`;
  const ticket = new URL(request.url).searchParams.get('t');
  const data = ticket ? await exchangePreviewTicket(id, ticket) : null;

  if (data?.session) {
    const secure = SITE_URL.startsWith('https://') && process.env.NODE_ENV === 'production';
    headers.append(
      'Set-Cookie',
      `rp_preview=${data.session}; Path=${page}; Max-Age=${data.expiresIn}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
    );
  }
  headers.set('Location', page);
  return new Response(null, { status: 303, headers });
}
