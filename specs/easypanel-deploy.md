# Deploy en EasyPanel — Guía paso a paso

## Requisitos
- VPS con EasyPanel instalado
- Repositorio Git (recomendado) o subida por FTP

## Paso 1: Crear proyecto

1. EasyPanel → **Projects** → **New Project**
2. Nombre: `quenns`

## Paso 2: Crear servicio App

1. **+ Service** → **App**
2. Fuente: **GitHub** (conecta tu repo) o **Upload**
3. Tipo de build: **Dockerfile**
4. Dockerfile path: `Dockerfile` (raíz del repo)
5. Puerto del contenedor: debe coincidir con la variable `PORT` (ej. `3009`)

## Paso 3: Variables de entorno

En la pestaña **Environment** del servicio (runtime, NO build-args):

```
PORT=3009
DATA_DIR=/data
ADMIN_PASSWORD=tu-password-segura
JWT_SECRET=genera-un-string-aleatorio-de-32-caracteres
NODE_ENV=production
```

> **Importante:** `PORT` solo en Environment, no en Build Arguments. El puerto del dominio y el del contenedor deben ser el mismo número.

## Paso 3b: Dominio y puerto (crítico)

En **Domains** al agregar tu dominio:

| Campo | Valor |
|-------|--------|
| Puerto destino / Container port | **3009** (el mismo que `PORT`) |

Si el dominio apunta al 3000 pero la app corre en 3009 → amarillo y sin web.

## Paso 4: Volumen persistente

En **Mounts** / **Volumes**:

| Mount path | Volume |
|------------|--------|
| `/data` | `quenns-data` (crear volumen nuevo) |

Esto guarda `content.json` y las fotos subidas.

## Paso 5: Dominio

1. **Domains** → agregar tu dominio o subdominio
2. EasyPanel configura HTTPS automáticamente (Let's Encrypt)

## Paso 6: Deploy

Click **Deploy**. EasyPanel construye la imagen Docker y la inicia.

## Verificación

| URL | Esperado |
|-----|----------|
| `/` | Home de Quenns |
| `/servicios` | Lista de servicios |
| `/chicas` | Grid de chicas |
| `/chicas/sofia` | Perfil |
| `/admin` | Login del panel |
| `/api/health` | `{"ok":true}` |

## Credenciales admin

- URL: `https://tudominio.com/admin`
- Password: la que pusiste en `ADMIN_PASSWORD`

## Backup

Periódicamente descarga el volumen `/data`:
- `content.json`
- carpeta `uploads/`

## Actualizar

Push a Git → EasyPanel **Redeploy** (o auto-deploy si está activado).

## Alternativa: Docker Compose

Si EasyPanel permite Compose, sube el `docker-compose.yml` de la raíz y configura las mismas variables.
