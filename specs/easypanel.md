# Spec: Deploy EasyPanel

## Servicio único Docker
- Puerto interno: `3000`
- Volumen persistente: `/data` → `content.json` + `uploads/`
- Variables de entorno requeridas:
  - `PORT=3000`
  - `DATA_DIR=/data`
  - `ADMIN_PASSWORD` (contraseña admin)
  - `JWT_SECRET` (secreto firma JWT)
  - `NODE_ENV=production`

## EasyPanel setup
1. Crear app → Docker Compose o Dockerfile
2. Montar volumen `quenns-data:/data`
3. Configurar dominio + SSL automático (EasyPanel/Caddy)
4. Exponer puerto 3000

## Healthcheck
`GET /api/health` → `{ "ok": true }`

## Build
Multi-stage Dockerfile:
1. `npm ci` + build web (Astro) + build api
2. Runtime: Node 20 Alpine, copia dist, ejecuta `node api/dist/index.js`
3. Hono sirve: API + uploads + static Astro dist + SPA admin

## i18n
Toggle ES/EN en cliente, `localStorage` key `quenns-lang`. Sin rutas duplicadas.

## Mapa
Leaflet + OpenStreetMap tiles (gratis, sin API key).
