import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { adminAction } from '@/lib/admin-api';
import { ProjectError } from '@/lib/project-validation';
import { storeAsset } from '@/lib/project-store';
export const runtime = 'nodejs';
export async function POST(request) { return adminAction(request, async () => {
  if (Number(request.headers.get('content-length')) > 3 * 1024 * 1024) throw new ProjectError('Choose an image smaller than 2 MB.', 413);
  const form = await request.formData(); const file = form.get('image');
  if (!(file instanceof File) || !['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new ProjectError('Upload a PNG, JPEG, or WebP image smaller than 2 MB.');
  let output;
  try { output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 24000000 }).rotate().resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer(); }
  catch { throw new ProjectError('This image could not be read. Try a different PNG, JPEG, or WebP.'); }
  return NextResponse.json({ url: await storeAsset(output) }, { status: 201 });
}); }
