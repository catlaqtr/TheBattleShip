# Battleship Backend Deployment (Render + Docker)

This repo is ready to deploy to Render as a Docker Web Service and to connect to a MySQL instance on Aiven (or any MySQL-compatible provider). Frontend can be deployed to Vercel.

## What’s included
- Dockerfile (multi-stage build: Maven -> lightweight JRE)
- .dockerignore (smaller image)
- render.yaml (Render blueprint with health check and env vars)
- Spring Boot already binds to `PORT` via `server.port=${PORT:8080}`

## Environment variables
Set these on Render:
- APP_JWT_SECRET: strong random string (or Base64). Example: `openssl rand -base64 48`
- APP_JWT_EXPIRATION_MS: optional, default `86400000` (1 day)
- SPRING_DATASOURCE_URL: JDBC URL from your MySQL provider. Examples:
  - `jdbc:mysql://<HOST>:<PORT>/<DBNAME>?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=utf8`
  - Prefer the JDBC URL provided by your provider’s console. If a CA cert is required, ensure it’s trusted by the JRE.
- SPRING_DATASOURCE_USERNAME: DB user
- SPRING_DATASOURCE_PASSWORD: DB password
- CORS_ALLOWED_ORIGINS: your Vercel URL, e.g. `https://your-frontend.vercel.app`

Important: This backend is configured for MySQL (dependencies: `mysql-connector-j`, `flyway-mysql`). If you use Postgres (e.g., Render’s managed Postgres), it will not work without code and migration changes. Use a MySQL provider (Aiven, PlanetScale, AWS RDS MySQL, etc.).

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

Run with H2 (no DB envs) — quick smoke test only. Note: When no datasource is provided, the app will try to start, but most endpoints require a DB. Prefer testing with a real MySQL URL.

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

Run against MySQL:

- Linux/macOS:
```bash
export PORT=8080
export APP_JWT_SECRET=change-me
export SPRING_DATASOURCE_URL="jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME=youruser
export SPRING_DATASOURCE_PASSWORD=yourpass
export CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

docker run --rm -p $PORT:$PORT \
  -e PORT=$PORT \
  -e APP_JWT_SECRET="$APP_JWT_SECRET" \
  -e SPRING_DATASOURCE_URL="$SPRING_DATASOURCE_URL" \
  -e SPRING_DATASOURCE_USERNAME="$SPRING_DATASOURCE_USERNAME" \
  -e SPRING_DATASOURCE_PASSWORD="$SPRING_DATASOURCE_PASSWORD" \
  -e CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS" \
  battleship:local
```

- Windows (cmd.exe):
```bat
set PORT=8080
set APP_JWT_SECRET=change-me
set SPRING_DATASOURCE_URL=jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC
set SPRING_DATASOURCE_USERNAME=youruser
set SPRING_DATASOURCE_PASSWORD=yourpass
set CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

docker run --rm -p %PORT%:%PORT% ^
  -e PORT=%PORT% ^
  -e APP_JWT_SECRET=%APP_JWT_SECRET% ^
  -e SPRING_DATASOURCE_URL="%SPRING_DATASOURCE_URL%" ^
  -e SPRING_DATASOURCE_USERNAME=%SPRING_DATASOURCE_USERNAME% ^
  -e SPRING_DATASOURCE_PASSWORD=%SPRING_DATASOURCE_PASSWORD% ^
  -e CORS_ALLOWED_ORIGINS=%CORS_ALLOWED_ORIGINS% ^
  battleship:local
```

## Frontend (Vercel)
- Point Vercel to your frontend repo.
- Configure the frontend to call this backend’s base URL on Render (e.g., `https://battleship-backend.onrender.com`).
- Make sure the backend has `CORS_ALLOWED_ORIGINS` set to your Vercel domain.

## Notes
- Flyway migrations run automatically on startup. The DB user must be allowed to CREATE/ALTER tables.
- If startup fails due to DB connectivity/SSL, copy the exact JDBC URL from your provider and ensure SSL params match their guidance.
- Swagger UI is disabled in prod by default; enable via properties if needed.
