// src/main.tsx - AKTUALISIERTE VERSION mit Error Boundary
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import '../index.css' // TailwindCSS aus dem Root-Verzeichnis
import App from './App.tsx'

// QueryClient mit besserer Fehlerbehandlung
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 Minute
      retry: (failureCount, error: any) => {
        // Nicht bei 404/401/403 wiederholen
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Max 2 Versuche bei anderen Fehlern
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Mutations nicht automatisch wiederholen
    }
  }
})

// Debug-Informationen in Development
if (import.meta.env.DEV) {
  console.log('🚀 Development Mode aktiv');
  console.log('📡 API wird über Proxy geroutet: /api → https://localhost:7024/api');
  console.log('🔧 Backend muss auf Port 7024 laufen (dotnet run)');
  console.log('🌐 Frontend läuft auf Port 3000');
  
  // Global Error Handler für unbehandelte Promise-Rejections
  window.addEventListener('unhandledrejection', event => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    if (event.reason?.message?.includes('Network Error')) {
      console.error('💡 Tipp: Prüfe ob das Backend läuft und die API-Konfiguration korrekt ist');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)