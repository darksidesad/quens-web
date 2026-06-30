import { extname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { Context } from 'hono';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export function resolveUploadFilename(requestPath: string): string | null {
  const name = requestPath.replace(/^\/uploads\/?/, '');
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    return null;
  }
  return name;
}

export async function serveUploadFile(
  c: Context,
  uploadsDir: string,
  requestPath: string,
): Promise<Response> {
  const filename = resolveUploadFilename(requestPath);
  if (!filename) return c.notFound();

  const filePath = join(uploadsDir, filename);
  if (!existsSync(filePath)) return c.notFound();

  const data = await readFile(filePath);
  const ext = extname(filename).toLowerCase();

  return c.body(data, 200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'public, max-age=86400',
  });
}

export function isAllowedImage(file: { type: string; name: string }): boolean {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']);
  if (allowed.has(file.type)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp' || ext === 'gif';
}
