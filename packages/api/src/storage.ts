import { mkdir, readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ContentSchema, defaultContent, type Content } from '@quenns/shared';

export interface StorageConfig {
  dataDir: string;
}

export function getContentPath(dataDir: string): string {
  return join(dataDir, 'content.json');
}

export function getUploadsDir(dataDir: string): string {
  return join(dataDir, 'uploads');
}

export async function ensureDataDir(dataDir: string): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await mkdir(getUploadsDir(dataDir), { recursive: true });
  const contentPath = getContentPath(dataDir);
  if (!existsSync(contentPath)) {
    await writeFile(contentPath, JSON.stringify(defaultContent, null, 2), 'utf-8');
  }
}

export async function readContent(dataDir: string): Promise<Content> {
  const raw = await readFile(getContentPath(dataDir), 'utf-8');
  return ContentSchema.parse(JSON.parse(raw));
}

export async function writeContent(dataDir: string, content: Content): Promise<Content> {
  const parsed = ContentSchema.parse(content);
  await writeFile(getContentPath(dataDir), JSON.stringify(parsed, null, 2), 'utf-8');
  return parsed;
}

export async function saveUpload(
  dataDir: string,
  filename: string,
  data: Uint8Array,
): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const finalName = `${Date.now()}-${safeName}`;
  const filePath = join(getUploadsDir(dataDir), finalName);
  await writeFile(filePath, data);
  return `/uploads/${finalName}`;
}

export async function deleteUpload(dataDir: string, filename: string): Promise<boolean> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = join(getUploadsDir(dataDir), safeName);
  if (!existsSync(filePath)) return false;
  await unlink(filePath);
  return true;
}

export async function listUploads(dataDir: string): Promise<string[]> {
  const dir = getUploadsDir(dataDir);
  if (!existsSync(dir)) return [];
  return readdir(dir);
}
