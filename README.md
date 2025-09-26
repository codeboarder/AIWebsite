# AI Website

A Vite + React single‑page app with:

* Top navigation (Menu Bar), Title Bar (with optional logo), and Footer
* Dedicated Contact page with phone + email links
* Chat page featuring a minimal “copilot” style interface
  * Streaming style assembly (currently reads full text; can be upgraded to true streaming)
  * Typing indicator bubble (animated dots) while awaiting a response
  * New Chat reset button (aborts in‑flight request, clears history)
  * Scrollable chat window with custom styled scrollbars
* Azure OpenAI backend stub (Express) keeping secrets server‑side
* Environment variable support via `.env` (root) + fallback `server/.env`

---

## Quick Start

```pwsh
# 1. Install dependencies
npm install

# 2. (Optional) Create .env for Azure OpenAI
Copy-Item .env.example .env
# Edit .env and fill in values

# 3. Run frontend (Vite) only
npm run dev

# Or run API + frontend concurrently (Windows PowerShell helper)
npm run dev:full

# Alternatively in two terminals:
# Terminal 1
npm run dev:api
# Terminal 2
npm run dev
```

Open the printed local URL (usually <http://localhost:5173>). The API listens on <http://localhost:3000>.

---

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run dev:api` | Start Express Azure OpenAI stub on port 3000 |
| `npm run dev:full` | Convenience: launches API then Vite (PowerShell specific) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Serve the built app locally to test prod bundle |

---

## Azure OpenAI Integration (Backend Stub)

The Express server (`server/index.js`) exposes `POST /api/chat` and relays messages to Azure OpenAI Chat Completions.

Environment variables (root `.env` recommended):

```text
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_OPENAI_DEPLOYMENT=<your-chat-deployment-name>
# Optional override:
AZURE_OPENAI_API_VERSION=2024-06-01
```

If any required variable is missing, the server returns a plain‑text explanation and the client falls back to heuristic assistant replies.

Security note: Never commit real keys. `.env` is in `.gitignore`.

---

## Chat Page Behavior

* User messages and assistant replies kept in local component state (`src/pages/Chat.jsx`).
* While waiting on a response, an inline typing indicator bubble (three animated dots) is shown.
* A temporary empty assistant message is inserted and progressively filled as chunks are decoded (currently the backend returns full text; logic is ready for streaming adaptation).
* Reset via “New Chat” button clears state and aborts any ongoing fetch (uses `AbortController`).
* Press Enter to send; Shift+Enter inserts a newline.

### Possible Future Enhancements
* True streaming support (server `stream: true` + server-sent parsing)
* Persist chat history (localStorage or backend)
* System / persona prompt selection
* Error retry + partial rollback
* Markdown rendering for assistant responses

---

## Project Structure

```text
AIWebsite/
├─ index.html           # HTML entry
├─ vite.config.js       # Vite config + /api proxy
├─ package.json
├─ server/
│  └─ index.js          # Express Azure OpenAI relay
├─ src/
│  ├─ main.jsx          # React root
│  ├─ App.jsx           # Layout + routing
│  ├─ components/       # MenuBar, TitleBar, Footer
│  ├─ pages/            # Contact.jsx, Chat.jsx
│  └─ styles.css        # Global + chat styles
├─ public/              # Static assets (logo, etc.)
└─ dist/                # Production build output
```

---

## Customization Guide

| Area | How |
| ---- | ---- |
| Branding / Logo | Replace `logo.png` or update `logoSrc` usage in `App.jsx` / `TitleBar.jsx`. |
| Navigation | Edit links in `src/App.jsx` (MenuBar props or route list). |
| Theme Colors | Adjust CSS variables at top of `src/styles.css`. |
| Chat Heuristics | Modify `assistantReply()` in `Chat.jsx` for offline fallback behavior. |
| Backend Logic | Extend `server/index.js` (add logging, switch to streaming, add auth, etc.). |

---

## Deployment Notes

1. Build the frontend: `npm run build` (outputs static assets in `dist/`).
2. Deploy `dist/` via static hosting (Azure Static Web Apps, Azure Storage static site, etc.).
3. Deploy/host the Express server separately (Azure App Service, Container Apps, etc.) and update the frontend fetch base URL (remove Vite dev proxy assumption) or add a reverse proxy.
4. Set environment variables in the server hosting environment.

For production, consider:
* Turning on streaming to reduce perceived latency.
* Adding request validation + rate limiting.
* CORS configuration if frontend and API origins differ.
* Logging + tracing (e.g., App Insights) for latency/error metrics.

---

## Troubleshooting

Issue | Check
----- | -----
No assistant reply | Is API server running (`npm run dev:api`)? Are env vars set? See server console.
Fallback heuristic always used | Missing or invalid Azure env vars; inspect network tab for `/api/chat` response.
Port conflict | Vite will auto-pick a new port; verify printed URL.
Wrong endpoint error | Ensure endpoint ends with `.openai.azure.com` and no trailing slash duplication.

---

## License

Internal / personal project scaffold. Add a license file if you intend to distribute.

---

Feel free to iterate—open an issue / add tasks for streaming, persistence, or richer UI.
