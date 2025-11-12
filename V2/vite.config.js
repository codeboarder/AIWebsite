import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple Vite config for V2 (no proxy by default)
export default defineConfig({
  plugins: [react()],
})
