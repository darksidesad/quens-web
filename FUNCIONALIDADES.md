# Quenns Spa — Funcionalidades del proyecto

> Web estática con panel de administración.  
> **Stack:** Astro + Tailwind · Hono API · JSON + disco (VPS) → Cloudflare después.  
> **Deploy:** EasyPanel en VPS (demo al cliente) → Cloudflare después.

---

## Resumen del producto

| Aspecto | Decisión |
|---------|----------|
| Marca | Quenns |
| Estilo | Elegante y oscuro |
| Idiomas | Español + Inglés (botón para cambiar) |
| Chicas estimadas | 15–22 |
| Reservas | WhatsApp con mensaje: `Hola, me interesa una cita con [nombre]` |
| Logo | Pendiente (texto tipográfico por ahora) |
| Moneda | COP |

---

## Fase 0 — Infraestructura y proyecto base

- [x] Inicializar proyecto Astro + Tailwind
- [x] Configurar tema visual elegante/oscuro (tipografía, colores, componentes base)
- [x] Estructura de carpetas (`pages`, `components`, `layouts`, `i18n`, `worker`, etc.)
- [x] Sistema de internacionalización (ES / EN) con botón de cambio de idioma
- [x] Archivo de datos inicial (`content.json`) con estructura definida
- [x] Variables de entorno documentadas (`.env.example`)
- [x] README con instrucciones de desarrollo local
- [x] README con instrucciones de deploy en VPS / EasyPanel
- [ ] README con instrucciones de deploy en Cloudflare (para después)

---

## Fase 1 — Sitio público (4 páginas)

### Layout global

- [x] Header con navegación (Home, Servicios, Chicas)
- [x] Botón de cambio de idioma (ES ↔ EN)
- [x] Footer con datos de contacto
- [x] Diseño responsive (móvil y desktop)
- [x] Nombre "Quenns" como marca tipográfica (sin logo por ahora)

### Home (`/`)

- [x] Hero editable: título, subtítulo, imagen de fondo
- [x] Sección de servicios destacados (preview)
- [x] Sección preview del equipo (chicas activas)
- [x] **Dirección** del spa visible
- [x] **Mapa embebido** (OpenStreetMap + Leaflet, gratis)
- [x] Botón WhatsApp general
- [x] Horarios generales del spa (footer)
- [x] Contenido traducido ES / EN

### Servicios (`/servicios`)

- [x] Listado de todos los servicios
- [x] Cada servicio: nombre, descripción, precio (COP), duración
- [x] Imagen opcional por servicio
- [x] Contenido traducido ES / EN

### Chicas (`/chicas`)

- [x] Grid/listado de chicas **activas** solamente
- [x] Orden manual definido desde el admin (drag & drop)
- [x] Tarjeta: foto principal, nombre, descripción corta
- [x] Enlace al perfil individual
- [x] Contenido traducido ES / EN

### Perfil de chica (`/chicas/[slug]`)

- [x] Nombre
- [x] Descripción
- [x] **Galería de varias fotos**
- [x] Servicios asignados a esa chica (solo los suyos)
- [x] Disponibilidad: días que trabaja (lun–dom)
- [x] Horario por día (ej. Lun 10:00–18:00)
- [x] Botón WhatsApp con mensaje: `Hola, me interesa una cita con [nombre]`
- [x] Chicas inactivas → no accesibles / 404
- [x] Contenido traducido ES / EN
- [x] Fallback dinámico para chicas nuevas sin rebuild

---

## Fase 2 — API y almacenamiento

### API pública (lectura)

- [x] `GET /api/content` — devuelve todo el JSON (home, servicios, chicas)
- [x] `GET /api/chicas` — listado de chicas activas
- [x] `GET /api/chicas/:slug` — perfil de una chica
- [x] Servir imágenes desde disco local (`/uploads`)

### API protegida (escritura — solo admin)

- [x] Autenticación JWT (`POST /api/auth/login`)
- [x] `PUT /api/content` — actualizar contenido completo
- [x] `POST /api/upload` — subir imagen
- [x] `DELETE /api/upload/:key` — eliminar imagen
- [x] Validación básica de datos en el servidor (Zod)

### Almacenamiento

- [x] JSON central con: `home`, `servicios`, `chicas`, `contacto`
- [ ] Bucket R2 para imágenes (producción Cloudflare)
- [x] Alternativa local en VPS: carpeta `uploads/` + JSON en disco
- [x] Límite de tamaño por imagen documentado (5MB en spec)

---

## Fase 3 — Panel de administración (`/admin`)

### Acceso y seguridad

- [x] Ruta `/admin` no indexable (noindex)
- [x] Login JWT (VPS)
- [x] Solo una persona admin

### Dashboard general

- [x] Vista resumen: cantidad de chicas activas/inactivas, servicios
- [x] Interfaz en español
- [x] Navegación entre secciones del admin

### Gestión de chicas (15–22)

- [x] Listar todas las chicas (activas e inactivas)
- [x] **Ordenar con drag & drop** (arrastrar y soltar)
- [x] Crear nueva chica
- [x] Editar chica existente
- [x] Activar / desactivar chica (toggle)
- [x] Eliminar chica (con confirmación)
- [x] Campos editables:
  - [x] Nombre (ES / EN)
  - [x] Slug (URL automática o manual)
  - [x] Descripción (ES / EN)
  - [x] Fotos (subir varias, eliminar)
  - [x] Servicios asignados (checkbox)
  - [x] Días de la semana que trabaja
  - [x] Horario por cada día activo
- [x] Vista previa del perfil público

### Gestión de servicios

- [x] Listar servicios
- [x] Crear servicio
- [x] Editar servicio
- [x] Eliminar servicio (con confirmación)
- [x] Campos editables:
  - [x] Nombre (ES / EN)
  - [x] Descripción (ES / EN)
  - [x] Precio (COP)
  - [x] Duración
  - [x] Imagen opcional

### Gestión del Home

- [x] Editar hero: título (ES / EN)
- [x] Editar hero: subtítulo (ES / EN)
- [x] Subir / cambiar imagen del hero
- [x] Controles de visualización del fondo del sitio en móvil (tamaño, posición, mosaico y opacidad del degradado)

### Gestión de eventos (`/eventos`)

- [x] CRUD completo desde el admin
- [x] Campos: título (ES/EN), descripción (ES/EN), fecha, hora opcional, lugar opcional, imagen de portada, enlace externo, toggle activo/inactivo, destacado
- [x] Orden manual de eventos
- [x] Página pública `/eventos` con separación próximos / pasados
- [x] i18n ES / EN

### Gestión de contacto

- [x] Número de WhatsApp
- [x] Dirección (ES / EN)
- [x] Coordenadas del mapa (lat/lng)
- [x] Horarios generales del spa (ES / EN)
- [x] Redes sociales opcionales (Instagram)

---

## Fase 4 — Internacionalización (i18n)

- [x] Archivos o estructura de traducciones UI
- [x] Contenido dinámico bilingüe en JSON (`nombre.es`, `nombre.en`)
- [x] Botón visible para cambiar idioma en el sitio público
- [x] Persistir idioma elegido (localStorage)
- [x] Misma URL para ambos idiomas (toggle rápido)
- [x] Admin: campos ES / EN para todo el contenido editable

---

## Fase 5 — Deploy en VPS / EasyPanel

- [x] Build de producción de Astro
- [x] API Hono corriendo en el mismo contenedor
- [x] Almacenamiento de imágenes en disco del VPS (volumen `/data`)
- [x] Docker + docker-compose.yml
- [x] Dockerfile multi-stage
- [x] Healthcheck `/api/health`
- [x] Guía deploy EasyPanel (`specs/easypanel-deploy.md`)
- [ ] Dominio apuntando al VPS (pendiente — lo haces tú en EasyPanel)
- [ ] HTTPS con Let's Encrypt (EasyPanel lo hace al asignar dominio)

---

## Fase 6 — Migración a Cloudflare (después de aprobar con cliente)

- [ ] Crear cuenta Cloudflare
- [ ] Conectar repo GitHub → Cloudflare Pages
- [ ] Crear bucket R2 y migrar imágenes
- [ ] Configurar Worker en Cloudflare
- [ ] Configurar Cloudflare Access en `/admin`
- [ ] Apuntar dominio final
- [ ] Migrar datos del VPS a R2
- [ ] Verificar SSL, caché y rendimiento

---

## Fase 7 — Calidad y extras

- [ ] SEO básico: meta title, description por página
- [ ] Open Graph para compartir en redes
- [x] Favicon (placeholder)
- [x] Página 404 personalizada
- [x] Optimización de imágenes (lazy load en galería)
- [ ] Accesibilidad básica (revisión manual)
- [ ] Pruebas en móvil real
- [ ] Logo oficial (cuando el cliente lo entregue)
- [x] Tests automatizados (shared + api + web smoke) — 20 tests

---

## Notas y decisiones

| Tema | Estado |
|------|--------|
| Logo Quenns | Pendiente — texto por ahora |
| Mapa | OpenStreetMap + Leaflet (gratis) |
| i18n URLs | Toggle + localStorage, misma URL |
| Auth VPS | JWT con `ADMIN_PASSWORD` |
| Dominio VPS demo | Pendiente (EasyPanel) |
| Telegram (canal/grupo) | Investigado. Ver detalles abajo |
| Fondo en móvil | Configurable (size / position / repeat / opacity) desde el admin |

### Integración con Telegram (investigación)

**Objetivo:** poder publicar contenido desde el panel admin hacia un canal o grupo de Telegram con 1 click.

**Opciones evaluadas:**

1. **Bot API (HTTPS, recomendado para este caso).** El admin tendría un botón "Publicar en Telegram" por evento/chica/servicio. El backend haría `POST https://api.telegram.org/bot<TOKEN>/sendPhoto` con `chat_id = @canal_o_grupo` y los datos del item (foto + caption con título y descripción). Es la vía estándar: simple, sin mantener conexiones, sin librerías de MTProto.

   - Crear bot con @BotFather → obtener `TELEGRAM_BOT_TOKEN`.
   - Añadir el bot como **administrador** del canal o grupo donde publicará.
   - Channel: `chat_id` puede ser `@username` o el id numérico (`-100...`). Grupo: id numérico.
   - Variables de entorno sugeridas: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
   - Endpoint propuesto: `POST /api/telegram/post` (auth admin) que recibe `{ type: 'evento'|'chica'|'servicio', id }` y publica usando la URL pública de la imagen.

2. **Webhooks / Bot interactivo.** Más complejo (necesita HTTPS público, lógica conversacional). No aporta valor al caso "1 click desde el admin".

3. **Cuenta de usuario (MTProto / gram.js).** Permite publicar como persona en vez de bot. Mayor dependencia (sesión, mantenimiento), librerías menos estables. **No recomendado** salvo que el cliente quiera publicar desde una cuenta personal ya existente.

**Decisión recomendada:** opción 1 (Bot API). Próximo paso, cuando se apruebe la integración: crear bot, añadirlo como admin del canal/grupo destino y exponer `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` en `.env`. La lógica de "1 click + mostrar resultado (éxito/error + link al mensaje publicado)" se implementa directamente en las pantallas de admin ya existentes.

---

## Progreso general

| Fase | Estado |
|------|--------|
| 0 — Infraestructura | ✅ Completa |
| 1 — Sitio público | ✅ Completa |
| 2 — API y almacenamiento | ✅ Completa (VPS) |
| 3 — Panel admin | ✅ Completa |
| 4 — i18n | ✅ Completa |
| 5 — Deploy VPS/EasyPanel | 🟡 Lista para deploy (falta tu dominio) |
| 6 — Cloudflare | ⬜ Pendiente |
| 7 — Calidad y extras | 🟡 Parcial |

---

*Última actualización: 29 jun 2026*
