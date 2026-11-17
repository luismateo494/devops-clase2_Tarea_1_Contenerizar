# =============================================================
# TaskFlow API · Dockerfile multi-stage (Clase 2)
# Uso:  docker build -t taskflow-api:1.0.0 .
# =============================================================

# ---------- Etapa 1: dependencias de producción ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Primero solo los manifiestos: esta capa se reutiliza (caché)
# mientras package.json / package-lock.json no cambien.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Etapa 2: imagen final ----------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# node_modules ya instalado en la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Código de la API (respeta .dockerignore: sin node_modules ni .env)
COPY --chown=node:node . .

# La imagen oficial de Node trae el usuario "node": no corremos como root
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
