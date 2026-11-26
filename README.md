# devops-clase2 · Práctica guiada

Proyecto de la práctica en vivo de la **Clase 2 · Dockerfiles Optimizados e Imágenes**
(Despliegue en la Nube y DevOps Básico, Talendig).

Vamos a escribir un **Dockerfile multi-stage** para la API y otro para el frontend React de
**TaskFlow**, construir las imágenes y correrlas conectadas al MongoDB de la Clase 1.

## Requisitos

- Docker Desktop abierto y en estado **running** (en Windows, con WSL2 activo).
- El contenedor `mongo` de la Clase 1 (usuario `admin`, clave `secret`, volumen `mongo-data`).
- Node.js 22 **solo** si quieres correr TaskFlow sin Docker para compararlo.
- Una terminal abierta **dentro de esta carpeta** (`devops-clase2`).

```powershell
docker --version
docker start mongo          # o créalo con el comando de la Clase 1
```

## Estructura

```
devops-clase2/
├── taskflow/                  Proyecto con sus Dockerfiles listos
│   ├── api/                   Express + Mongoose · puerto 3000
│   │   ├── src/server.js      Lee MONGO_URI, PORT y CORS_ORIGIN del entorno
│   │   ├── src/routes/tareas.js   CRUD en /api/tareas  ·  GET /health
│   │   ├── src/models/Tarea.js    Colección "tareas" (la misma del seed de la Clase 1)
│   │   ├── package.json + package-lock.json   ← npm ci necesita el lockfile
│   │   └── .env.example
│   └── web/                   React 18 + Vite + React Router
│       ├── src/api.js         Usa import.meta.env.VITE_API_URL
│       ├── src/pages/Tareas.jsx         /tareas
│       ├── src/pages/DetalleTarea.jsx   /tareas/:id  (prueba de try_files)
│       └── package.json + package-lock.json
├── solucion/                  Lo que se escribe en clase (plan B si alguien se atrasa)
│   ├── api/  Dockerfile · Dockerfile.ingenuo · Dockerfile.typescript · .dockerignore
│   └── web/  Dockerfile · nginx.conf · .dockerignore
└── comandos/
    ├── demo-clase2.ps1        Todos los comandos, paso a paso (Windows)
    └── demo-clase2.sh         Lo mismo para macOS, Linux, Git Bash o WSL
```

## Paso 0 · (Opcional) Ver TaskFlow sin Docker

Sirve para mostrar el problema: hay que instalar Node, dependencias y configurar cada cosa a mano.

```powershell
cd taskflow\api;  copy .env.example .env;  npm install;  npm run dev
# en otra terminal
cd taskflow\web;  copy .env.example .env;  npm install;  npm run dev   # http://localhost:5173
```

Detén ambos procesos (Ctrl+C) antes de seguir: usan los mismos puertos.

## Práctica 1 · Dockerfile de la API

Crear `taskflow/api/.dockerignore` y `taskflow/api/Dockerfile` (diapositivas 11 y 18).
Comparar con `Dockerfile.ingenuo` para ver el tamaño y la caché.

```powershell
cd taskflow\api
docker build -t taskflow-api:1.0.0 .
docker run -d --name api -p 3000:3000 `
  -e MONGO_URI="mongodb://admin:secret@host.docker.internal:27017/taskflow?authSource=admin" `
  taskflow-api:1.0.0
docker logs api              # debe decir: Conectado a MongoDB
curl.exe http://localhost:3000/health
docker exec api whoami       # node
```

## Práctica 2 · Dockerfile del frontend

Crear `taskflow/web/.dockerignore`, `taskflow/web/nginx.conf` y `taskflow/web/Dockerfile` (diapositiva 19).

```powershell
cd ..\web
docker build -t taskflow-web:1.0.0 --build-arg VITE_API_URL=http://localhost:3000 .
docker run -d --name web -p 8080:80 taskflow-web:1.0.0
```

Abre http://localhost:8080: deben aparecer las tareas del seed de la Clase 1.
Crea una tarea, ábrela y recarga con **F5**: si no da 404, `try_files` funciona.
La barra superior muestra la URL de la API que quedó "horneada" en el build.

## Práctica 3 · Verificar

```powershell
docker images --filter "reference=taskflow-*"   # compara tamaños
docker exec api ls -a                            # no debe aparecer .env
docker exec web ls /usr/share/nginx/html         # solo estáticos
docker rm -f api web                             # limpieza
```

## Errores frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| La API se cierra: `Falta la variable de entorno MONGO_URI` | No se pasó `-e MONGO_URI=...` | Agregarlo al `docker run` |
| `ECONNREFUSED 127.0.0.1:27017` | Se usó `localhost` dentro del contenedor | Usar `host.docker.internal` (Compose lo resuelve el jueves) |
| `Authentication failed` | Falta `?authSource=admin` o credenciales distintas | Revisar usuario/clave del contenedor `mongo` |
| `port is already allocated` | `npm run dev` o un contenedor viejo usa el puerto | Detener el proceso local o `docker rm -f api web` |
| La barra dice `API: sin configurar` | Faltó `--build-arg VITE_API_URL` | Reconstruir pasando el build-arg |
| "No se pudo conectar con la API" en el navegador | API detenida o CORS | `docker logs api`; el origen 8080 ya está permitido por defecto |
| 404 al recargar `/tareas/<id>` | `nginx.conf` no se copió | Verificar `COPY nginx.conf ...` y reconstruir |
| `npm ci` falla | Se borró `package-lock.json` | Restaurarlo o `npm install` y volver a construir |


# TaskFlow - Stack completo con Docker

Aplicación web para gestión de tareas (React + Node.js + MongoDB) contenerizada con Docker.

## Requisitos previos
- Tener instalado [Docker](https://docs.docker.com/get-docker/) y Docker Compose.

## Cómo levantar el proyecto desde cero

1. Clona el repositorio y entra a la carpeta:
   ```bash
   git clone <URL_repositorio>
   cd taskflow


## Pipeline CI/CD (GitHub Actions)

Este proyecto implementa un flujo de trabajo profesional para garantizar la calidad del código y automatizar el despliegue.

--Integración Continua (CI)-
En cada Pull Request hacia la rama main, se ejecuta el workflow ci.yml:

Job api: Instala dependencias, ejecuta el linter (lint) y los tests (test).

Job web: Instala dependencias, ejecuta el linter, los tests y compila el proyecto (build).

Job docker: Depende de que los jobs anteriores pasen. Construye las imágenes con docker compose build para asegurar que el stack no se rompa.

La rama main está protegida y exige que estos 3 checks pasen obligatoriamente antes de permitir un merge.

Despliegue Continuo (CD)
Al hacer merge a main o al crear un tag de versión (ej: v1.0.0), se ejecuta el workflow cd.yml:

Construye las imágenes de Docker de la API y del Frontend.

Publica las imágenes automáticamente en GitHub Container Registry (GHCR).

Utiliza caché de capas (type=gha) para acelerar futuras construcciones.

Estrategia de Tags de Imágenes
Las imágenes en GHCR se publican con los siguientes tags:

sha-<commit> y latest: En cada push a la rama main.

1.0.0 y 1.0: Al crear un tag de Git como v1.0.0.

