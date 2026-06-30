# Spec: API REST Quenns

Base URL: `/api`

## Público (sin auth)

### GET /content
Devuelve `Content` completo. Chicas inactivas incluidas (admin las filtra en UI).

### GET /chicas
Solo chicas `activa: true`, ordenadas por `orden` ASC.

### GET /chicas/:slug
Perfil de chica activa. 404 si inactiva o no existe.

### GET /uploads/*
Sirve archivos estáticos de `/data/uploads`.

## Protegido (Bearer JWT)

Header: `Authorization: Bearer <token>`

### POST /auth/login
Body: `{ "password": string }`  
Response: `{ "token": string }`

### PUT /content
Body: `Content` validado con Zod. Persiste en `data/content.json`.

### POST /upload
Multipart `file`. Response: `{ "url": "/uploads/filename" }`

### DELETE /upload/:filename
Elimina archivo del disco.

## Errores
| Código | Cuándo |
|--------|--------|
| 400 | Validación fallida |
| 401 | Sin token o token inválido |
| 404 | Recurso no encontrado |
| 413 | Archivo > 5MB |
