# Frontend — Quick Start (Vite + React)

## 1) Configure env
Copy `.env.example` → `.env` and set:
- `VITE_COGNITO_DOMAIN` (e.g., `your-domain.auth.us-east-1.amazoncognito.com`)
- `VITE_USER_POOL_CLIENT_ID` (from Cognito App client)
- `VITE_REDIRECT_URI` / `VITE_LOGOUT_URI` (e.g., `http://localhost:5173` for local dev)
- `VITE_API_BASE` (HTTP API invoke URL)

## 2) Run locally
```bash
npm install
npm run dev
```

Open the printed localhost URL (defaults to http://localhost:5173).

## 3) Deploy to S3 website
- Build: `npm run build` → uploads `dist/` to your web bucket.
- Enable static website hosting on the web bucket and point to `index.html`.
- Add your S3 website URL to Cognito App client **Allowed callback URLs**.