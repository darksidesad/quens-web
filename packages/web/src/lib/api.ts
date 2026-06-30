import type { Content } from '@quenns/shared';

const API_BASE = typeof window !== 'undefined' ? '' : (import.meta.env.PUBLIC_API_URL || 'http://localhost:3000');

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
  if (!res.ok) throw new Error('Error al guardar');
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
  if (!res.ok) throw new Error('Error al subir imagen');
  const { url } = await res.json();
  return url;
}

export function imageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
}
