# Quenns Spa

Web estática + panel admin para spa. Astro + Tailwind + Hono API.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) (`corepack enable` o `npm i -g pnpm`)

## Desarrollo local

```bash
pnpm install
pnpm --filter @quenns/shared build
pnpm --filter @quenns/api dev    # terminal 1 — puerto 3000
pnpm --filter @quenns/web dev    # terminal 2 — puerto 4321 (proxy /api → 3000)
```

O en una sola terminal:

```bash
pnpm dev
```

- Sitio: http://localhost:4321
- API: http://localhost:3000/api/health
- Admin: http://localhost:4321/admin (password: `quenns-dev` por defecto en API)

## Tests

```bash
pnpm test
```

## Build producción

```bash
pnpm build
node packages/api/dist/index.js
```

## Deploy en EasyPanel (VPS)

### 1. Subir el proyecto

Clona el repo en tu VPS o súbelo por Git.

### 2. Crear app en EasyPanel

1. Entra a EasyPanel → **Create Service** → **App**
2. Elige **Docker Compose** o **Dockerfile**
3. Apunta al repositorio/carpeta de este proyecto
4. Puerto interno: **3000**

### 3. Variables de entorno

| Variable | Valor |
|----------|-------|
| `PORT` | `3000` |
| `DATA_DIR` | `/data` |
| `ADMIN_PASSWORD` | Tu contraseña segura |
| `JWT_SECRET` | String aleatorio 32+ caracteres |
| `NODE_ENV` | `production` |

### 4. Volumen persistente

Monta un volumen en `/data` para conservar:
- `content.json` (todo el contenido)
- `uploads/` (fotos)

En `docker-compose.yml` ya está configurado como `quenns-data:/data`.

### 5. Dominio y SSL

En EasyPanel asigna tu dominio/subdominio al servicio. EasyPanel gestiona HTTPS automáticamente.

### 6. Verificar

- `https://tudominio.com` → Home
- `https://tudominio.com/admin` → Panel (no indexable)
- `https://tudominio.com/api/health` → `{"ok":true}`

### Build manual (sin EasyPanel)

```bash
docker compose build
docker compose up -d
```

## Estructura

```
quenns/
├── packages/
│   ├── shared/   # Tipos, validación Zod, i18n
│   ├── api/      # Hono API + sirve sitio estático
│   └── web/      # Astro + Tailwind + React
├── data/         # content.json + uploads (volumen Docker)
├── specs/        # Especificaciones
├── Dockerfile
└── docker-compose.yml
```

## Mapa

OpenStreetMap + Leaflet (gratis, sin API key).

## i18n

Toggle ES/EN en header. Misma URL, idioma en `localStorage`.

## Cloudflare (después)

Ver `FUNCIONALIDADES.md` fase 6.
