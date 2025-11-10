import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config
// - React plugin for fast HMR
// - Dev server proxy so frontend can call /api/* without CORS issues
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api requests to the Express server running locally
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
