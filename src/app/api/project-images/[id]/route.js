import { readAsset } from '@/lib/project-store';
import { getAdminSession } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  try { const asset = await readAsset(id); if (!asset || !asset.published && !await getAdminSession()) return new Response(null, { status: 404 }); return new Response(new Uint8Array(asset.bytes), { headers: { 'Content-Type': asset.mime_type, 'Cache-Control': asset.published ? 'public, max-age=300' : 'private, no-store', 'X-Content-Type-Options': 'nosniff' } }); }
  catch { return new Response(null, { status: 503 }); }
}
