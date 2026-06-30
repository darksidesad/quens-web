import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
import { defaultContent } from '@quenns/shared';
import { getUploadsDir } from './storage.js';

const ADMIN_PASSWORD = 'test-admin-pass';
const JWT_SECRET = 'test-jwt-secret';

describe('API', () => {
  let dataDir: string;
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'quenns-test-'));
    app = createApp({
      dataDir,
      adminPassword: ADMIN_PASSWORD,
      jwtSecret: JWT_SECRET,
    });
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  async function request(path: string, init?: RequestInit) {
    return app.request(`http://localhost${path}`, init);
  }

  async function login(): Promise<string> {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });
    expect(res.status).toBe(200);
    const { token } = await res.json();
    return token;
  }

  it('GET /api/health responde ok', async () => {
    const res = await request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('GET /api/content devuelve contenido por defecto', async () => {
    const res = await request('/api/content');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.home.hero.titulo.es).toBe('Quenns Spa');
    expect(data.chicas.length).toBeGreaterThan(0);
  });

  it('GET /api/chicas solo devuelve activas', async () => {
    const res = await request('/api/chicas');
    const chicas = await res.json();
    expect(chicas.every((c: { activa: boolean }) => c.activa)).toBe(true);
  });

  it('GET /api/chicas/:slug devuelve perfil', async () => {
    const res = await request('/api/chicas/sofia');
    expect(res.status).toBe(200);
    const chica = await res.json();
    expect(chica.slug).toBe('sofia');
  });

  it('GET /api/chicas/:slug 404 para inexistente', async () => {
    const res = await request('/api/chicas/no-existe');
    expect(res.status).toBe(404);
  });

  it('POST /api/auth/login rechaza password incorrecto', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('PUT /api/content requiere auth', async () => {
    const res = await request('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultContent),
    });
    expect(res.status).toBe(401);
  });

  it('PUT /api/content guarda cambios con token', async () => {
    const token = await login();
    const updated = structuredClone(defaultContent);
    updated.home.hero.titulo.es = 'Quenns Actualizado';

    const res = await request('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });
    expect(res.status).toBe(200);

    const getRes = await request('/api/content');
    const data = await getRes.json();
    expect(data.home.hero.titulo.es).toBe('Quenns Actualizado');
  });

  it('POST /api/upload sube imagen con auth', async () => {
    const token = await login();
    const form = new FormData();
    const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' });
    form.append('file', blob, 'test.jpg');

    const res = await request('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    expect(res.status).toBe(200);
    const { url } = await res.json();
    expect(url).toMatch(/^\/uploads\//);
  });

  it('GET /uploads sirve imagen subida', async () => {
    const token = await login();
    const form = new FormData();
    const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], { type: 'image/jpeg' });
    form.append('file', blob, 'serve-test.jpg');

    const uploadRes = await request('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const { url } = await uploadRes.json();
    const filename = url.replace(/^\/uploads\//, '');
    expect(existsSync(join(getUploadsDir(dataDir), filename))).toBe(true);

    const fileRes = await request(url);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers.get('content-type')).toContain('image/jpeg');
  });
});
