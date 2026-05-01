import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Все /api/* запросы автоматически идут на Django :8000
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        credentials: true,
      }
    }
  }
})
