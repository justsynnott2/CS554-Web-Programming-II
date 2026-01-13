## FitTracker (CS554 Final Project)

FitTracker is a full‑stack fitness + nutrition tracker with workouts, meals, progress logs, and a simple social feed. It’s built as a React frontend backed by an Express + MongoDB API, with Redis caching and MinIO for image storage.

### What you can do

- **Auth + profile**: register/login, update profile details, upload a profile picture
- **Workouts**: create/edit/delete workouts and exercises
- **Meals**: log meals and upload meal photos
- **Progress**: track progress entries and upload progress photos
- **Feed**: view and interact with posts (likes + comments)

### Tech stack

- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Node/Express + TypeScript, Mongoose (MongoDB), Redis, MinIO
- **Infra**: Docker Compose (MongoDB + Redis + MinIO + backend + frontend)

---

## Quick start (recommended): Docker Compose

### Prereqs

- Docker Desktop (or Docker Engine + Compose)

### Start everything

This project is designed to run via Docker Compose (MongoDB + Redis + MinIO + backend + frontend).

From the repo root:

```bash
docker compose up --build
```

Then open:

- **Frontend**: `http://localhost:3001`
- **Backend health**: `http://localhost:3000/health`
- **MinIO Console**: `http://localhost:9001`

### Login (seeded data)

On the **first run**, the database is automatically seeded with sample data.

- **Email**: `john@example.com`
- **Password**: `PasswordPassword@123`

### Stop / restart

- Stop containers: press `Ctrl+C` in the terminal running `docker compose up`
- Stop containers (detached mode): `docker compose down`

---

## Port Configuration (Docker Compose)

This project uses Docker Compose with configurable ports. If you have local services running on the default ports, you can override them by creating a `.env` file in the root directory.

### Default Ports

- **MongoDB**: 27017
- **Redis**: 6379
- **MinIO API**: 9000
- **MinIO Console**: 9001
- **Backend API**: 3000
- **Frontend**: 3001

### Customizing Ports

Create a `.env` file in the root directory with your custom ports:

```env
MONGODB_PORT=27018
REDIS_PORT=6380
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003
BACKEND_PORT=3002
FRONTEND_PORT=3003
CORS_ORIGIN=http://localhost:3003
REACT_APP_API_URL=http://localhost:3002/api
```

**Note**: If you change `BACKEND_PORT` or `FRONTEND_PORT`, make sure to also update `CORS_ORIGIN` and `REACT_APP_API_URL` accordingly. If you change the backend port, also set `PUBLIC_BACKEND_BASE_URL` (used for generating public file URLs).

---

## Seed data (important)

The `docker-compose.yml` includes a dedicated **one-shot** `seed` service that runs `backend/seed.js` before the backend starts.

### What happens on `docker compose up`

- **If the database is empty**: `seed` inserts sample data, then exits successfully.
- **If the database already has users**: `seed` **skips** (so your data is preserved).

### Seeded accounts

The seed script creates several users (e.g. `john@example.com`, `jane@example.com`, etc.).

- **Password for all seeded users**: `PasswordPassword@123`

### Force wipe + reseed (optional)

If you want to wipe the DB and reseed from scratch:

```bash
docker compose run --rm -e SEED_FORCE=true seed
```

### Reset everything (nuclear option)

This deletes the Mongo/Redis/MinIO volumes (all stored data), then reseeds on next `up`:

```bash
docker compose down -v
docker compose up --build
```

---

## Password requirements

Registration/login enforces a strong password policy:

- **At least 16 characters**
- Must include **uppercase**, **lowercase**, **number**, and a **symbol**

---

## File uploads (images)

Uploads are restricted to images:

- **Allowed**: JPEG/JPG, PNG, WEBP
- **Max size**: 5 MB per file
- Meal/progress uploads allow **up to 5 images** per request

Images are stored in MinIO and served to the browser via the backend under:

- `GET /api/files/:objectName`

---

## Optional: EDAMAM Food Search API (Meals page)

The **Food Search** feature uses Edamam’s Recipes API. If you don’t set the keys, food search will show an error like **“Missing Edamam API keys in environment variables”**. The rest of the app still works.

### Get API credentials

- Create an Edamam developer account and get:
  - `EDAMAM_APP_ID`
  - `EDAMAM_APP_KEY`
- Optional (recommended by Edamam for tracking): `EDAMAM_ACCOUNT_USER` (any stable string, e.g. your email or username)

### Set keys (Docker)

Create or edit the root `.env` file (same one used for port overrides) and add:

```env
EDAMAM_APP_ID=your_app_id_here
EDAMAM_APP_KEY=your_app_key_here
EDAMAM_ACCOUNT_USER=your_email_or_username_here
```

Then restart containers:

```bash
docker compose up --build
```

---

## Troubleshooting

- **Ports already in use**: change the ports in the root `.env`.
- **“Seed skipped…” but you want fresh data**:
  - Docker: `docker compose run --rm -e SEED_FORCE=true seed`
- **Blank/failed image uploads**: ensure MinIO is running and `MINIO_*` env vars match where it’s reachable.

---
