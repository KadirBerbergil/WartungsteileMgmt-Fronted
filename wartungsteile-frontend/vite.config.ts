// vite.config.ts - Port 3000 erzwingen
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Erzwingt Port 3000, bricht ab wenn belegt
    host: true, // Erlaubt externe Verbindungen
    proxy: {
      '/api': {
        target: 'https://localhost:7024',
        changeOrigin: true,
        secure: false
      }
    }
  }
})