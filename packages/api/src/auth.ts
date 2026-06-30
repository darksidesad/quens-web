import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

export async function createToken(secret: string, expiresIn = '7d'): Promise<string> {
  const key = encoder.encode(secret);
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const key = encoder.encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
