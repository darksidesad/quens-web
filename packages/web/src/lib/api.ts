import type { Content } from '@quenns/shared';

const API_BASE = typeof window !== 'undefined' ? '' : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3000');

/** Decode a JWT payload without verifying the signature (client-side only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Returns `true` when the stored JWT has expired (or is malformed).
 * Safe to call at any time — returns `false` when there is no token.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return false; // no token ≠ expired; the caller should check for presence separately
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true; // malformed → treat as expired
  // exp is in seconds; add a 30-second buffer so we don't make a request that will fail
  return Date.now() >= (payload.exp - 30) * 1000;
}

/**
 * Handle a 401 response from the API by clearing the token and reloading.
 * Returns `true` if the response was a 401 (caller should stop processing).
 */
function handleUnauthorizedResponse(res: Response): boolean {
  if (res.status === 401) {
    setToken(null);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return true;
  }
  return false;
}

export async function fetchContent(): Promise<Content> {
  const res = await fetch(`${API_BASE}/api/content`);
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export function getToken(): string | null {
  return localStorage.getItem('quenns-admin-token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('quenns-admin-token', token);
  else localStorage.removeItem('quenns-admin-token');
}

export async function login(password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  const { token } = await res.json();
  setToken(token);
  return token;
}

export async function saveContent(content: Content, token: string): Promise<Content> {
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    if (handleUnauthorizedResponse(res)) throw new Error('Sesión expirada');
    const body = await res.json().catch(() => ({})) as { error?: string; details?: { fieldErrors?: Record<string, string[]> } };
    if (body.error === 'Validation failed') {
      const fields = body.details?.fieldErrors;
      const hint = fields ? Object.keys(fields).slice(0, 2).join(', ') : '';
      throw new Error(hint ? `Datos inválidos: ${hint}` : 'Datos inválidos al guardar');
    }
    throw new Error(body.error || 'Error al guardar');
  }
  return res.json();
}

export async function uploadFile(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    if (handleUnauthorizedResponse(res)) throw new Error('Sesión expirada');
    const body = await res.json().catch(() => ({})) as { error?: string };
    if (res.status === 413) throw new Error('Imagen muy pesada (máx. 10 MB)');
    if (body.error === 'Invalid file type') throw new Error('Formato no válido. Usa JPG, PNG o WEBP');
    throw new Error(body.error || 'Error al subir imagen');
  }
  const { url } = await res.json();
  return url;
}

export function imageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
}
