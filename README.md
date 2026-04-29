# saas-whatsapp-checkout

Multi-tenant SaaS: businesses create branded storefronts, customers order via WhatsApp checkout.

## Dev

```bash
npm install          # install concurrently in root
npm run dev          # starts client + server via concurrently
cd client && npm i   # if client deps missing
cd server && npm i   # if server deps missing
```

## Sandbox

All data stored as local JSON in `server/data/`. Switch to Firebase in production later.
