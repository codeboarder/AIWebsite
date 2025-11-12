# AIWebsite

A small React playground with two variants:

- V1: React + Vite app with an Express API for local development.
- V2: Lightweight single-page React app with Home and Chat sections (front-end only).

## Repository structure

```text
AIWebsite/
  V1/                 # React + Vite + Express (dev) version
    index.html
    package.json
    vite.config.js
    public/
    server/
      index.js
    src/
      App.jsx
      main.jsx
      styles.css
      components/
      lib/
      pages/
  V2/                 # React + Vite SPA (Home + Chat)
    index.html
    package.json
    vite.config.js
    src/
      App.jsx
      main.jsx
      styles.css
      components/
        Home.jsx
        Chat.jsx
```

## Prerequisites

- Node.js (LTS recommended)
- Windows PowerShell (pwsh)

## Quick start

### V1 (React + Vite with Express dev server)

Install dependencies:

```powershell
npm install --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"
```

Run the API and front-end together (one command):

```powershell
npm run dev:full --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"
```

Or run them separately in two terminals:

```powershell
# Terminal 1: Express API on http://localhost:3000
npm run dev:api --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"

# Terminal 2: Vite dev server (proxies /api to :3000)
npm run dev --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"
```

Build and preview:

```powershell
npm run build --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"
npm run preview --prefix "c:\Users\rickwey\source\repos\AIWebsite\V1"
```

### V2 (Single-page Home + Chat)

Install dependencies:

```powershell
npm install --prefix "c:\Users\rickwey\source\repos\AIWebsite\V2"
```

Run the dev server:

```powershell
npm run dev --prefix "c:\Users\rickwey\source\repos\AIWebsite\V2"
```

Build and preview:

```powershell
npm run build --prefix "c:\Users\rickwey\source\repos\AIWebsite\V2"
npm run preview --prefix "c:\Users\rickwey\source\repos\AIWebsite\V2"
```

## Troubleshooting

- Vite preview says the default port is in use and shows another port (e.g., 4174). This is expected—open the printed URL.
- To expose the dev/preview server on your LAN, run with `-- --host` (double dashes pass args to Vite):

```powershell
npm run dev --prefix "c:\Users\rickwey\source\repos\AIWebsite\V2" -- --host
```

- For V1 API calls during dev, requests to `/api/*` are proxied to `http://localhost:3000`. Ensure the Express server is running when using the front-end.

## Notes

- V2 uses a simple in-page view switcher for Home/Chat—no router required.
- Styling uses a primary color palette and accessible focus outlines. You can tweak colors in `V2/src/styles.css`.
