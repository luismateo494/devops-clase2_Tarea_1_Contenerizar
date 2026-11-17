# =============================================================
# Clase 2 · Guion de comandos para la demo en vivo (bash · macOS/Linux; en Linux usa xdg-open)
# Ejecutar bloque por bloque desde la carpeta devops-clase2.
# No correr todo de una vez.
# =============================================================

# --- 0. Mongo de la Clase 1 (si no está corriendo) ---------------
docker ps -a --filter "name=mongo"
docker start mongo   # si ya existe
# o crearlo de nuevo:
# docker run -d --name mongo -p 27017:27017 \
#   -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=secret \
#   -v mongo-data:/data/db mongo:7

# --- 0b. Copiar los archivos Docker de la solución al proyecto ---
# (en la demo en vivo se escriben a mano; esto es el "plan B")
cp solucion/api/* taskflow/api/
cp solucion/api/.dockerignore taskflow/api/
cp solucion/web/* taskflow/web/
cp solucion/web/.dockerignore taskflow/web/

# --- 1. Comparar: Dockerfile ingenuo vs. optimizado --------------
cd taskflow/api
docker build -f Dockerfile.ingenuo -t taskflow-api:ingenuo .
docker build -t taskflow-api:1.0.0 .
docker images --filter "reference=taskflow-api"
# Ver las capas y su tamaño
docker history taskflow-api:1.0.0

# --- 2. Demostrar la caché de capas -----------------------------
# Cambia una línea de código (ej. un mensaje de console.log en src/server.js) y reconstruye:
docker build -t taskflow-api:1.0.1 .
#  -> "CACHED" en  RUN npm ci  : solo se rehace COPY . .
# Ahora agrega una dependencia y reconstruye:
#   npm install dayjs
docker build -t taskflow-api:1.0.2 .
#  -> se invalida desde COPY package*.json en adelante

# --- 3. Correr la API ------------------------------------------
docker run -d --name api -p 3000:3000 \
  -e MONGO_URI="mongodb://admin:secret@host.docker.internal:27017/taskflow?authSource=admin" \
  taskflow-api:1.0.0
docker logs -f api          # Ctrl+C para salir
docker exec api whoami      # debe responder: node
curl http://localhost:3000/api/tareas
curl http://localhost:3000/health

# --- 4. Frontend -----------------------------------------------
cd ../web
docker build -t taskflow-web:1.0.0 --build-arg VITE_API_URL=http://localhost:3000 .
docker run -d --name web -p 8080:80 taskflow-web:1.0.0
open http://localhost:8080
# Abrir el detalle de una tarea (/tareas/<id>) y recargar con F5: no debe dar 404

# --- 5. Verificaciones finales ---------------------------------
docker images --filter "reference=taskflow-*"
docker ps
docker exec web ls /usr/share/nginx/html   # solo estáticos, sin node_modules
docker exec api ls -a                      # NO debe aparecer .env

# --- 6. Versionado de imágenes ---------------------------------
docker tag taskflow-api:1.0.0 taskflow-api:latest
docker images taskflow-api

# --- 7. Limpieza -----------------------------------------------
docker rm -f api web
docker rmi taskflow-api:ingenuo taskflow-api:1.0.1 taskflow-api:1.0.2
docker image prune -f
