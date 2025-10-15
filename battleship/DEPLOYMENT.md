# Battleship Backend Deployment (Render + Docker)

This repo is ready to deploy to Render as a Docker Web Service and to connect to a MySQL instance on Aiven. Frontend can be deployed to Vercel.

## What’s included
- Dockerfile (multi-stage build: Maven -> lightweight JRE)
- .dockerignore (smaller image)
- render.yaml (Render blueprint with health check and env vars)
- Spring Boot already binds to `PORT` via `server.port=${PORT:8080}`

## Environment variables
Set these on Render:
- APP_JWT_SECRET: strong random string (or Base64). Example: `openssl rand -base64 48`
- APP_JWT_EXPIRATION_MS: optional, default `86400000` (1 day)
- DB_URL: JDBC URL from Aiven (MySQL). Example:
  - `jdbc:mysql://<HOST>:<PORT>/<DBNAME>?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=utf8`
  - Prefer the JDBC URL provided by Aiven’s console. If Aiven requires a CA cert, either use their public CA or provide a Java truststore.
- DB_USERNAME: Aiven DB user
- DB_PASSWORD: Aiven DB password
- CORS_ALLOWED_ORIGINS: your Vercel URL, e.g. `https://your-frontend.vercel.app`

## Deploy on Render (Blueprint)
1. Push this repo to GitHub.
2. On Render, New -> Blueprint and point to this repo.
3. Confirm the service `battleship-backend` detected from `render.yaml`.
4. Fill in the env var values above (you can update later in the service settings).
5. Deploy. Render will build the Docker image and run the service.

Health check: `/actuator/health/readiness` (configured in `render.yaml`).

## Deploy on Render (manual Docker service)
If you don’t use the blueprint:
1. New -> Web Service -> Use existing repo.
2. Environment: Docker.
3. Root directory: repo root (where the Dockerfile is).
4. Health check path: `/actuator/health/readiness`.
5. Add the env vars above.
6. Deploy.

## Local test with Docker

Build the image:

- Linux/macOS:
```bash
docker build -t battleship:local .
```

- Windows (cmd.exe):
```bat
docker build -t battleship:local .
```

Run with H2 (no DB envs) — good for a quick smoke test:

- Linux/macOS:
```bash
export PORT=8080
docker run --rm -p 8080:8080 -e PORT=$PORT battleship:local
```

- Windows (cmd.exe):
```bat
set PORT=8080
docker run --rm -p 8080:8080 -e PORT=%PORT% battleship:local
```

Run against Aiven MySQL:

- Linux/macOS:
```bash
export PORT=8080
export APP_JWT_SECRET=change-me
export DB_URL="jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME=youruser
export DB_PASSWORD=yourpass
export CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

docker run --rm -p $PORT:$PORT \
  -e PORT=$PORT \
  -e APP_JWT_SECRET="$APP_JWT_SECRET" \
  -e DB_URL="$DB_URL" \
  -e DB_USERNAME="$DB_USERNAME" \
  -e DB_PASSWORD="$DB_PASSWORD" \
  -e CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS" \
  battleship:local
```

- Windows (cmd.exe):
```bat
set PORT=8080
set APP_JWT_SECRET=change-me
set DB_URL=jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC
set DB_USERNAME=youruser
set DB_PASSWORD=yourpass
set CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

docker run --rm -p %PORT%:%PORT% ^
  -e PORT=%PORT% ^
  -e APP_JWT_SECRET=%APP_JWT_SECRET% ^
  -e DB_URL="%DB_URL%" ^
  -e DB_USERNAME=%DB_USERNAME% ^
  -e DB_PASSWORD=%DB_PASSWORD% ^
  -e CORS_ALLOWED_ORIGINS=%CORS_ALLOWED_ORIGINS% ^
  battleship:local
```

## Frontend (Vercel)
- Point Vercel to your frontend repo.
- Configure the frontend to call this backend’s base URL on Render (e.g., `https://battleship-backend.onrender.com`).
- Make sure the backend has `CORS_ALLOWED_ORIGINS` set to your Vercel domain.

## Notes
- Flyway migrations run automatically on startup.
- If startup fails due to DB connectivity/SSL, copy the exact JDBC URL from Aiven and ensure SSL params match their guidance.
- Swagger UI is disabled in prod by default; enable via properties if needed.

