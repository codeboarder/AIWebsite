# AI Website

A minimal React app (Vite) with a menu bar, title bar, and footer.

## Run locally

```pwsh
# from the AIWebsite folder
npm install
npm run dev
```

Then open the printed local URL (usually <http://localhost:5173>).

## Build for production

```pwsh
npm run build
npm run preview
```

## Project structure

- `index.html` — App HTML entry
- `src/main.jsx` — React entry
- `src/App.jsx` — Layout composition
- `src/components/*` — MenuBar, TitleBar, Footer
- `src/styles.css` — Base styles
- `vite.config.js` — Vite config

## Customize

- Update menu items in `src/App.jsx`.
- Change colors/layout in `src/styles.css`.
