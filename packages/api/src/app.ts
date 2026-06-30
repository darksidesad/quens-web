import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import {
  ContentSchema,
  getActiveChicas,
  getChicaBySlug,
} from '@quenns/shared';
import {
  ensureDataDir,
  readContent,
  writeContent,
  saveUpload,
  deleteUpload,
  getUploadsDir,
} from './storage.js';
import { createToken, verifyToken, extractBearer } from './auth.js';
import { serveUploadFile, isAllowedImage } from './uploads.js';

function mkdirSyncSafe(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface AppConfig {
  dataDir: string;
  adminPassword: string;
  jwtSecret: string;
  staticDir?: string;
}

export function createApp(config: AppConfig) {
  const app = new Hono();

  app.use('/api/*', cors());

  app.get('/api/health', (c) => c.json({ ok: true }));

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json<{ password?: string }>();
    if (body.password !== config.adminPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const token = await createToken(config.jwtSecret);
    return c.json({ token });
  });

  const authMiddleware = async (c: Parameters<Parameters<typeof app.use>[1]>[0], next: () => Promise<void>) => {
    const token = extractBearer(c.req.header('Authorization'));
    if (!token || !(await verifyToken(token, config.jwtSecret))) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    await next();
  };

  app.get('/api/content', async (c) => {
    await ensureDataDir(config.dataDir);
    const content = await readContent(config.dataDir);
    return c.json(content);
  });

  app.get('/api/chicas', async (c) => {
    await ensureDataDir(config.dataDir);
    const content = await readContent(config.dataDir);
    return c.json(getActiveChicas(content));
  });

  app.get('/api/chicas/:slug', async (c) => {
    await ensureDataDir(config.dataDir);
    const content = await readContent(config.dataDir);
    const chica = getChicaBySlug(content, c.req.param('slug'));
    if (!chica) return c.json({ error: 'Not found' }, 404);
    return c.json(chica);
  });

  app.put('/api/content', authMiddleware, async (c) => {
    const body = await c.req.json();
    const parsed = ContentSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    await ensureDataDir(config.dataDir);
    const saved = await writeContent(config.dataDir, parsed.data);
    return c.json(saved);
  });

  app.post('/api/upload', authMiddleware, async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') {
      return c.json({ error: 'No file provided' }, 400);
    }
    if (!isAllowedImage(file)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return c.json({ error: 'File too large' }, 413);
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    await ensureDataDir(config.dataDir);
    const url = await saveUpload(config.dataDir, file.name, buffer);
    return c.json({ url });
  });

  app.delete('/api/upload/:filename', authMiddleware, async (c) => {
    await ensureDataDir(config.dataDir);
    const deleted = await deleteUpload(config.dataDir, c.req.param('filename'));
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ ok: true });
  });

  const uploadsDir = getUploadsDir(config.dataDir);
  mkdirSyncSafe(uploadsDir);

  app.use('*', async (c, next) => {
    if (c.req.method !== 'GET') return next();
    const pathname = new URL(c.req.url).pathname;
    if (!pathname.startsWith('/uploads/')) return next();
    return serveUploadFile(c, uploadsDir, pathname);
  });

  if (config.staticDir && existsSync(config.staticDir)) {
    app.get('/_astro/*', serveStatic({ root: join(config.staticDir, '_astro') }));
    app.get('/favicon.svg', serveStatic({ path: join(config.staticDir, 'favicon.svg') }));

    app.get('/chicas/:slug', async (c) => {
      const slug = c.req.param('slug');
      const staticPath = join(config.staticDir!, 'chicas', slug, 'index.html');
      if (existsSync(staticPath)) {
        return c.html(await readFile(staticPath, 'utf-8'));
      }
      const fallback = join(config.staticDir!, 'chicas', 'fallback', 'index.html');
      if (existsSync(fallback)) {
        const html = await readFile(fallback, 'utf-8');
        return c.html(html.replace('</head>', `<script>window.__QUENNS_SLUG__="${slug}";</script></head>`));
      }
      return c.notFound();
    });

    app.get('*', serveStatic({ root: config.staticDir }));
    app.get('*', (c) => {
      const indexPath = join(config.staticDir!, 'index.html');
      if (existsSync(indexPath)) {
        return c.html(readFileSync(indexPath, 'utf-8'));
      }
      return c.notFound();
    });
  }

  return app;
}

export function getDefaultDataDir(): string {
  const env = process.env.DATA_DIR;
  if (env) return env;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, '../../../data');
}
