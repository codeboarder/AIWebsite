# AI Website

Vite + React single‑page application with a lightweight Express API relay for Azure OpenAI and a persistent, multi‑session chat UI.

## Current Feature Overview

UI / Layout

* Title Bar (logo capable), Menu Bar navigation, Footer
* Contact page (clickable email / phone links)

Chat Experience

* Multi‑session conversation model (sessions persisted in `localStorage` under `chat_sessions_v1`)
* Sidebar “History” list (only shows sessions that contain at least one user message; empty/greeting‑only session stays hidden)
* Rename (✎) and Delete (✕) actions per visible session
* “Clear Chat” button resets the current session back to greeting (does NOT create a new session)
* Typing indicator (animated dots) while awaiting backend response
* Markdown rendering for assistant replies (basic formatting, code blocks, lists, links)
* Scrollable chat window with custom styled scrollbars
* Local fallback heuristic replies if backend fails / not configured

Backend / Architecture

* API service under `server/` – non‑streaming Chat Completions relay to Azure OpenAI
* Keeps API key & endpoint server‑side; frontend only calls `/api/chat`
* Clean separation: UI can be deployed as static assets; API can scale independently

Persistence

* Per‑session conversations stored locally (no server storage yet)
* Automatic migration from legacy single history (`chat_history_v1`) to sessions on first load

Observability / Debug

* Optional debug logging via `VITE_CHAT_DEBUG=1` (logs load/persist events, network calls)

Not Currently Enabled

* True token streaming (server sends full answer after model completes; code structured so streaming can be reintroduced later)
* Creation of new sessions via UI (disabled—history only lists sessions after meaningful user interaction)

---

## Quick Start

```pwsh
# 1. Install dependencies (root)
npm install

# 2. Configure environment variables for API (root .env or server/.env)
#    Copy an example and fill in your Azure values
Copy-Item .env.example .env
# or
Copy-Item server/.env.example server/.env

# 3. Run API (terminal 1)
npm run dev:api

# 4. Run UI (terminal 2)
npm run dev

# (Optional) Single command helper (Windows PowerShell) to start API then UI:
npm run dev:full
```

Open the printed UI URL (usually <http://localhost:5173>). The API listens on <http://localhost:3000> unless `PORT` is overridden in `.env` or `server/.env`.

---

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run dev:api` | Start API service in `server/` (Express relay) |
| `npm run dev:full` | Convenience: launches API then Vite (PowerShell specific) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Serve the built app locally to test prod bundle |

---

## Azure OpenAI Integration (API Service)

The API service (`server/index.js`) exposes `POST /api/chat` and relays messages (non‑streaming) to Azure OpenAI Chat Completions. It responds with the assistant content as plain text.

Environment variables (set in root `.env` or `server/.env`):

```text
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=<key>
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_VERSION=2024-06-01   # or a newer supported version
PORT=3000                              # optional override
```

If required variables are missing, the endpoint returns a plain text diagnostic; the UI then falls back to heuristic responses.

Security Notes

* Do NOT commit real keys; keep `api/.env` out of version control.
* Consider adding rate limiting, request auth, and logging (e.g., Application Insights) before production hardening.

---

## Chat Page Behavior

State & Persistence

* Sessions stored locally (`localStorage: chat_sessions_v1`).
* Only sessions containing at least one user message appear in the History sidebar.
* Clearing a chat keeps the session object but resets messages to the greeting.

Interaction

* Enter to send; Shift+Enter inserts newline.
* Typing indicator shows while awaiting the API.
* Assistant replies are rendered with lightweight Markdown.
* Rename or delete sessions via icon buttons; deletion re-selects a remaining session (or creates a fresh hidden greeting session if all are removed).

Recovery & Fallback

* If the API fails (network / config), a heuristic assistant reply is generated client-side.

### Current Limitations

* Non‑streaming responses (full assistant reply delivered after model completes).
* No server‑side persistence or user identity scoping.
* Sessions stored entirely client-side (cleared by browser storage wipes / different device).

### Possible Future Enhancements

* True streaming (SSE) reintroduction.
* Export / import sessions (JSON download / upload).
* Token usage & cost estimation per session.
* Session search / filter & pinning.
* Backend persistence + authentication (per-user history).
* System / persona prompt presets.
* Syntax highlighting in code blocks.
* Rate limit & error retry strategy.

---

## Project Structure

```text
AIWebsite/
├─ index.html              # HTML entry
├─ vite.config.js          # Vite configuration
├─ package.json            # Dependencies & scripts
├─ server/
│  ├─ index.js             # Azure OpenAI relay (non‑streaming)
│  └─ .env.example         # Example env vars for server only (optional)
├─ src/
│  ├─ main.jsx             # React root
│  ├─ App.jsx              # Routing & layout
│  ├─ components/          # MenuBar, TitleBar, Footer
│  ├─ pages/
│  │  ├─ Chat.jsx          # Multi‑session chat UI
│  │  └─ Contact.jsx
│  ├─ lib/markdown.js      # Lightweight markdown renderer
│  └─ styles.css           # Theme & component styles
├─ public/                 # Static assets (e.g., logo)
└─ dist/                   # Production build output (UI)
```

---

## Customization Guide

| Area | How |
| ---- | ---- |
| Branding / Logo | Replace `logo.png` or update `logoSrc` usage in `App.jsx` / `TitleBar.jsx`. |
| Navigation | Edit links in `src/App.jsx` (MenuBar props or route list). |
| Theme Colors | Adjust CSS variables at top of `src/styles.css`. |
| Chat Heuristics | Modify `assistantReply()` in `Chat.jsx` for offline fallback behavior. |
| Sessions Sidebar | Adjust filtering / ordering logic in `Chat.jsx` (e.g., show empty sessions). |
| Backend Logic | Extend `api/src/index.js` (add logging, streaming, auth, rate limiting). |
| Markdown Rules | Update `src/lib/markdown.js` to support additional syntax. |

---

## Deployment Notes

1. Build the frontend: `npm run build` (outputs static assets in `dist/`).
2. Deploy `dist/` (Azure Static Web Apps, Azure Storage Static Website, CDN, etc.).
3. Deploy the API service (`server/`) separately (Azure App Service, Container Apps, Functions custom handler, etc.).
4. Configure environment variables (Azure OpenAI credentials) in the API hosting environment.
5. For production, either:
   * Host API at the same origin under `/api` (recommended; use reverse proxy), or
   * Set `VITE_API_BASE_URL` during UI build (e.g., `https://your-api-host`) so the browser fetches the remote API.

For production, consider:

* Reintroduce streaming to reduce perceived latency.
* Request validation + rate limiting / WAF.
* CORS tightening (restrict to UI origin).
* Observability (App Insights / OpenTelemetry).
* Authentication (user‑scoped histories if backend persistence added).

---

## Troubleshooting

| Issue | Check |
| ----- | ----- |
| No assistant reply | Is API server running (`npm run dev:api`)? Env vars set in `api/.env`? Check API console. |
| Always heuristic fallback | Network error or Azure credentials invalid; inspect `/api/chat` response body. |
| History missing after refresh | Confirm `localStorage` not blocked. Check `chat_sessions_v1` key in DevTools > Application (or Storage) panel. |
| Cannot see new session in sidebar | Sessions appear only after the first user message (design choice). |
| Wrong endpoint error | Ensure endpoint ends with `.openai.azure.com` (no duplicate trailing slash). |

---

## License

Internal / personal project scaffold. Add a license file if you intend to distribute.

---

Feel free to iterate—open an issue / add tasks for streaming, persistence, or richer UI.
