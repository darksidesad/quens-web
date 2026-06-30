import { cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'packages/web/dist');
const dest = join(root, 'packages/api/web-dist');

if (!existsSync(src)) {
  console.error('Web dist not found. Run pnpm --filter @quenns/web build first.');
  process.exit(1);
}

cpSync(src, dest, { recursive: true });
console.log('Copied web dist to packages/api/web-dist');
