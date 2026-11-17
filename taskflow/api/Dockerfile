# ---------- Etapa 1: dependencias ----------
FROM node:22-alpine AS deps
WORKDIR /app

# Copiamos solo los manifiestos para aprovechar la caché
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo las de desarrollo si las hubiera)
RUN npm ci


# ---------- Etapa 2: imagen final ----------
FROM node:22-alpine

# Definimos el entorno
ENV NODE_ENV=production
WORKDIR /app

# Copiamos los manifiestos a la imagen final
COPY package*.json ./

# La tarea pide explícitamente esto aquí:
RUN npm ci --omit=dev && npm cache clean --force

# Ahora sí, copiamos el código
COPY src/ ./src/

# Usamos el usuario no root
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
