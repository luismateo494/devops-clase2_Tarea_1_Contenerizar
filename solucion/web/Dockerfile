# =============================================================
# TaskFlow Web (React + Vite) · Dockerfile multi-stage (Clase 2)
# Uso:
#   docker build -t taskflow-web:1.0.0 --build-arg VITE_API_URL=http://localhost:3000 .
# =============================================================

# ---------- Etapa 1: compilar ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite lee VITE_* en tiempo de build: el valor queda "horneado" en el JS.
# Cambiar la URL de la API exige volver a construir la imagen.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servir estáticos con Nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# CMD heredado de la imagen de nginx: nginx -g 'daemon off;'

# Nota: si el proyecto usa Create React App, la carpeta es /app/build
# y las variables deben empezar con REACT_APP_.
