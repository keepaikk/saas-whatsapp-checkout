# Deployment Environment Configuration
# ⚠️ ALL values set manually on Dokploy during deployment. No secrets in code.

## Dokploy Environment Variables (Required)

### Server (Docker / Node container)
| Variable | Dev Value | Production Value | Notes |
|----------|-----------|------------------|-------|
| `PORT` | `3001` | `3001` | Container exposed port |
| `NODE_ENV` | `development` | `production` | Toggles behavior + logging |
| `DATA_DIR` | `./data` | `/app/data` | Persistent volume mount in Dokploy |
| `UPLOAD_DIR` | `./public/uploads` | `/app/public/uploads` | Persistent volume for uploaded images |
| `CORS_ORIGIN` | `http://localhost:5173` | `https://yourdomain.com` | Blocked if dev value left in prod |
| `FIREBASE_PROJECT_ID` | — | `your-project-id` | Only when switching from local JSON |
| `FIREBASE_PRIVATE_KEY` | — | `-----BEGIN PRIVATE KEY-----...` | Service account JSON private key |
| `FIREBASE_CLIENT_EMAIL` | — | `firebase-adminsdk...` | Service account email |
| `FIREBASE_DATABASE_URL` | — | `https://...firebaseio.com` | Realtime DB URL |
| `FIREBASE_STORAGE_BUCKET` | — | `...appspot.com` | Cloud Storage bucket |

### Client (Static build / served by nginx)
| Variable | Dev Value | Production Value | Notes |
|----------|-----------|------------------|-------|
| `VITE_API_URL` | `http://localhost:3001` | `https://api.yourdomain.com` | No trailing slash |

## Pre-Deploy Checklist
- [ ] All `FIREBASE_*` vars filled OR `DATA_DIR` points to persistent volume
- [ ] `CORS_ORIGIN` exactly matches deployed frontend domain (no wildcard in prod)
- [ ] `UPLOAD_DIR` volume mounted with write perms
- [ ] `VITE_API_URL` matches deployed server URL
- [ ] `.env` NOT committed to Git (check `.gitignore`)
- [ ] Run production build: `npm run build` (client) then serve static files

## Deployment Architecture (Dokploy)
```
┌──────────────────────────────────────────────┐
│  Dokploy Reverse Proxy (Traefik)             │
│  yourdomain.com → client static files (spa)  │
│  api.yourdomain.com → Express server         │
└──────────────────────────────────────────────┘
         │                        │
    ┌────▼────┐            ┌─────▼─────┐
    │  nginx  │            │  Node.js  │
    │  (spa)  │            │ (Express) │
    └────┬────┘            └─────┬─────┘
         │                     │
    ┌────▼────┐            ┌───▼──────────┐
    │ /dist   │            │ /app/data     │ ← mounted volume
    └─────────┘            │ /app/uploads  │ ← mounted volume
                         └───────────────┘
```

## Switching from Local JSON to Firebase
1. Copy `server/.env.example` to `server/.env`
2. Fill `FIREBASE_*` env vars from Firebase Console → Project Settings → Service Accounts
3. Update `server/src/db.ts`: swap `JsonDb` singletons for Firebase SDK calls
4. Run seed script to migrate existing `server/data/*.json` into Firebase
5. Mark `DATA_DIR` as optional (disable persistence)
