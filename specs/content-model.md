# Spec: Modelo de contenido Quenns

## LocalizedString
```ts
{ es: string; en: string }
```

## Content (raíz)
| Campo | Tipo | Requerido |
|-------|------|-----------|
| home.hero.titulo | LocalizedString | sí |
| home.hero.subtitulo | LocalizedString | sí |
| home.hero.imagen | string (URL path) | no |
| contacto.whatsapp | string E.164 | sí |
| contacto.direccion | LocalizedString | sí |
| contacto.mapa.lat | number | sí |
| contacto.mapa.lng | number | sí |
| contacto.horarios | LocalizedString | sí |
| contacto.instagram | string | no |
| servicios[] | Servicio | min 0 |
| chicas[] | Chica | min 0 |

## Servicio
| Campo | Tipo |
|-------|------|
| id | uuid |
| nombre | LocalizedString |
| descripcion | LocalizedString |
| precio | number (COP) |
| duracion | string |
| imagen | string |
| orden | number |

## Chica
| Campo | Tipo |
|-------|------|
| id | uuid |
| slug | string kebab-case, único |
| nombre | LocalizedString |
| descripcion | LocalizedString |
| fotos | string[] |
| servicios | string[] (ids) |
| dias | ('lun'\|'mar'\|'mie'\|'jue'\|'vie'\|'sab'\|'dom')[] |
| horarios | Record<dia, { inicio: HH:mm, fin: HH:mm }> |
| activa | boolean |
| orden | number |

## Reglas
- Chicas inactivas no aparecen en GET /api/chicas público
- Slug único entre chicas
- WhatsApp link: `https://wa.me/{digits}?text=Hola, me interesa una cita con {nombre}`
- Imágenes max 5MB, tipos: jpeg, png, webp
