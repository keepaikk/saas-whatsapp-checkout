# Deployment Guide — Dokploy Docker Compose

> **Deploy target:** Dokploy (self-hosted or cloud)
> **Method:** Docker Compose (multi-service: `api` + `web`)
> **CI/CD:** GitHub Actions builds and pushes image to Docker Hub / GHCR

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Dokploy Reverse Proxy (Traefik)                │
│  yourdomain.com    →  web (nginx)               │
│  api.yourdomain.com →  api (Express on :3001)  │
└─────────────────────────────────────────────────┘
         │                      │
   ┌─────▼──────┐        ┌────▼──────┐
   │   nginx    │        │ Express   │
   │  (static)  │        │  Node.js  │
   │  SPA dist  │        │  :3001    │
   └────────────┘        │           │
                         │  /data    │ ← volume (persistent)
                         │  /uploads │ ← volume (persistent)
                         └───────────┘
```

---

## Pre-Deploy Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | Dokploy server installed with Docker + Traefik | ☐ |
| 2 | GitHub repo connected to Dokploy (Git Provider) | ☐ |
| 3 | Docker Hub or GHCR registry added in Dokploy UI | ☐ |
| 4 | All env vars pasted into Dokploy UI (see list below) | ☐ |
| 5 | `.gitignore` excludes `.env` and `data/` | ☐ |
| 6 | Domain DNS A-record points to Dokploy server IP | ☐ |
| 7 | `docker-compose.yml` committed to Git | ☐ |
| 8 | `Dockerfile` exists in `server/` and `client/` | ☐ |

---

## Environment Variables (Dokploy UI)

Create a **Docker Compose** project in Dokploy, then paste ALL these variables into the Dokploy Environment tab.

> **Important:** Dokploy writes these to an `.env` file next to your `docker-compose.yml` but **does NOT auto-inject** them into containers. The `docker-compose.yml` below uses `env_file: - .env` so all variables are available.

### Server (`api` service)

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `PORT` | `3001` | Container internal port |
| `NODE_ENV` | `production` | Controls logging, error handling |
| `DATA_DIR` | `/app/data` | Must match volume mount |
| `UPLOAD_DIR` | `/app/public/uploads` | Must match volume mount |
| `CORS_ORIGIN` | `https://yourdomain.com` | **Exact** frontend domain (no wildcard) |
| `FIREBASE_PROJECT_ID` | `my-app-prod` | From Firebase Console |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----..."` | Paste full key in quotes |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@...` | Service account email |
| `FIREBASE_DATABASE_URL` | `https://...firebaseio.com` | RTDB URL |
| `FIREBASE_STORAGE_BUCKET` | `...appspot.com` | Cloud Storage bucket |

### Client (`web` service)

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `VITE_API_URL` | `https://api.yourdomain.com` | No trailing slash |
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `my-app.firebaseapp.com` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `my-app-prod` | Same as server |
| `VITE_FIREBASE_STORAGE_BUCKET` | `...appspot.com` | Same as server |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `000000000000` | From Firebase config |
| `VITE_FIREBASE_APP_ID` | `1:...:web:...` | From Firebase config |

---

## Steps to Deploy

### 1. Create Dokploy Docker Compose Project
1. Dokploy UI → **Projects** → **Create Project**
2. Name: `saas-whatsapp-checkout`
3. **Service** → **Docker Compose**
4. Source: **Git Provider** → connect `keepaikk/saas-whatsapp-checkout`
5. Branch: `feat/saas-starter` (or `main`)
6. Compose file: `docker-compose.yml` (root of repo)

### 2. Add Environment Variables
1. Go to the **Environment** tab in your Dokploy project
2. Paste all variables listed above (copy from your local `.env`)
3. Click **Save**
4. Dokploy will write them to `.env` next to `docker-compose.yml`

### 3. Configure Domains
1. Dokploy UI → **Domains**
2. For `web` service:
   - Type: `Custom Domain`
   - Domain: `yourdomain.com`
   - HTTPS: On (auto via Let's Encrypt)
3. For `api` service (optional, if separating):
   - Type: `Custom Domain`
   - Domain: `api.yourdomain.com`
   
> **If you don't separate API to a subdomain**, nginx in the `web` service proxies `/api` and `/uploads` to the `api` service internally. This is the default in our `docker-compose.yml`.

### 4. Deploy
1. Click **Deploy** in Dokploy UI
2. Watch the deployment logs
3. On success, visit `https://yourdomain.com`

---

## CI/CD Pipeline (GitHub Actions + Docker Hub)

> **Dokploy builds can freeze small servers** (RAM/CPU spikes). To avoid this, build images in CI/CD and **pull pre-built images** in Dokploy.

### Setup
1. Create Docker Hub repo: `yourdockerhub/saas-whatsapp-checkout-server`
2. Create Docker Hub repo: `yourdockerhub/saas-whatsapp-checkout-web`
3. Add secrets to GitHub repository:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
4. Update `.github/workflows/deploy.yml` with your Docker Hub username

### Workflow
- On every push to `main`:
  1. Build server + client images
  2. Tag with `latest` and `sha-xxx`
  3. Push to Docker Hub
  4. Dokploy auto-deploys (if webhook configured)

---

## Switching from JSON DB to Firebase

1. Set all `FIREBASE_*` env vars in Dokploy UI
2. Update `server/src/db.ts`: replace `JsonDb` with Firebase SDK
3. Run migration script (backup `data/*.json` first)
4. Remove `api_data` volume from `docker-compose.yml` (optional — keeps backups)

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `GET /api/businesses` fails | CORS mismatch | Ensure `CORS_ORIGIN` **exactly** matches frontend domain |
| Uploads disappear on redeploy | Volume not persisted | Dokploy → Volumes → ensure `api_uploads` is mapped |
| Blank white screen on `/admin` | SPA routing missing | nginx `try_files` handles this — check `client/nginx.conf` |
| 502 Bad Gateway | API not healthy | Check `api` service logs, verify healthcheck |
| Build timeout on Dokploy | Low server RAM/CPU | Use GitHub Actions CI/CD + pull pre-built images |

---

## File Reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Dokploy Docker Compose definition |
| `server/Dockerfile` | Node.js API container spec |
| `client/Dockerfile` | Build → Nginx SPA container spec |
| `client/nginx.conf` | Reverse proxy + SPA fallback |
| `.env.example` | Reference for all env vars |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
