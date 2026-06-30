# quenns-build-node-22.13 — cambiar este comentario invalida caché de Docker
ARG NODE_IMAGE=node:22.13.1-alpine3.21

# Build stage
FROM ${NODE_IMAGE} AS builder

ARG GIT_SHA=dev
RUN echo "Build GIT_SHA=${GIT_SHA}" && node --version

RUN npm install -g pnpm@10.12.1 && pnpm --version

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/api ./packages/api
COPY packages/web ./packages/web
COPY data ./data

RUN node --version && pnpm --filter @quenns/shared build
RUN node --version && pnpm --filter @quenns/web build
RUN node --version && pnpm --filter @quenns/api build

RUN cp -r packages/web/dist packages/api/web-dist

# Empaqueta API + @quenns/shared + deps en carpeta autocontenida (sin symlinks rotos)
RUN pnpm --filter @quenns/api --prod deploy --legacy /deploy
RUN cp -r packages/api/web-dist /deploy/web-dist

# Production stage
FROM ${NODE_IMAGE} AS runner

RUN apk add --no-cache wget

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

RUN mkdir -p /data/uploads

COPY --from=builder /deploy /app
COPY --from=builder /app/data/content.json /data/content.json

EXPOSE 3000

# Usa $PORT en runtime (EasyPanel puede asignar 3009, etc.)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

CMD ["node", "dist/index.js"]
