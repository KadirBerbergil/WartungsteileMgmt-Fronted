// vite.config.ts - Optimized for production with code splitting
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
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'chart-vendor': ['recharts'],
          'grid-vendor': ['react-grid-layout']
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@headlessui/react',
      'recharts'
    ]
  }
})