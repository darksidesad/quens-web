import { serve } from '@hono/node-server';
import { createApp, getDefaultDataDir } from './app.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const port = Number(process.env.PORT) || 3000;
const dataDir = getDefaultDataDir();
const adminPassword = process.env.ADMIN_PASSWORD || 'quenns-dev';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticCandidates = [
  join(__dirname, '../web-dist'),
  join(__dirname, '../../web/dist'),
];
const staticDir = staticCandidates.find((p) => existsSync(p));

const app = createApp({ dataDir, adminPassword, jwtSecret, staticDir });

serve({ fetch: app.fetch, port }, () => {
  console.log(`Quenns API running on http://localhost:${port}`);
  if (staticDir) console.log(`Serving static from ${staticDir}`);
});
