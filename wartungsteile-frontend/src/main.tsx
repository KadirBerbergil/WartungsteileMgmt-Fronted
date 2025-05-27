// src/main.tsx - Verbesserte und robuste App-Initialisierung
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import '../index.css'
import App from './App.tsx'

// Enhanced QueryClient mit robuster Fehlerbehandlung
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 Minute
      retry: (failureCount, error: any) => {
        // Detaillierte Retry-Logik
        console.log(`🔄 Query Retry ${failureCount + 1}/3:`, {
          error: error.message,
          status: error?.response?.status,
          category: error?.category
        });

        // Bei Client-Fehlern (4xx) nicht wiederholen
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          console.log('❌ Client-Fehler - Kein Retry');
          return false;
        }

        // Bei Netzwerk- oder Server-Fehlern max. 2 Versuche
        if (failureCount < 2) {
          console.log('🔄 Retry wird durchgeführt...');
          return true;
        }

        console.log('❌ Max. Retry-Versuche erreicht');
        return false;
      },
      retryDelay: (attemptIndex) => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
        console.log(`⏱️ Retry-Delay: ${delay}ms`);
        return delay;
      },
      onError: (error: any) => {
        console.error('❌ Query Error:', {
          message: error.message,
          userMessage: error.userMessage,
          category: error.category,
          status: error?.response?.status,
          timestamp: new Date().toISOString()
        });
      }
    },
    mutations: {
      retry: false, // Mutations nicht automatisch wiederholen
      onError: (error: any, variables, context) => {
        console.error('❌ Mutation Error:', {
          error: error.message,
          userMessage: error.userMessage,
          category: error.category,
          variables,
          context,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
});

// Development-spezifische Debugging-Features
if (import.meta.env.DEV) {
  console.log('🚀 Wartungsteile Management System - Development Mode');
  console.log('📊 System-Informationen:', {
    node: navigator.userAgent,
    frontend: window.location.origin,
    apiProxy: '/api → https://localhost:7024/api',
    timestamp: new Date().toISOString()
  });
  
  // React Query DevTools in Development
  import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
    console.log('🔧 React Query DevTools verfügbar');
  });

  // Global Error Handler für unbehandelte Promise-Rejections
  window.addEventListener('unhandledrejection', event => {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise,
      timestamp: new Date().toISOString()
    });
    
    if (event.reason?.message?.includes('Network Error')) {
      console.error('💡 Netzwerk-Fehler Tipps:');
      console.error('   1. Backend prüfen: dotnet run');
      console.error('   2. API-Konfiguration: Nutze /api statt https://localhost:7024/api');
      console.error('   3. Proxy-Konfiguration in vite.config.ts prüfen');
      console.error('   4. Browser-Konsole auf CORS-Fehler prüfen');
    }
    
    // Event als behandelt markieren, um Browser-Warnung zu vermeiden
    event.preventDefault();
  });

  // Global Error Handler für JavaScript-Fehler
  window.addEventListener('error', event => {
    console.error('🚨 Global JavaScript Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString()
    });
  });

  // Performance-Monitoring in Development
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('⚡ Performance Metrics:', {
        domContentLoaded: `${Math.round(perfData.domContentLoadedEventEnd - perfData.navigationStart)}ms`,
        fullLoad: `${Math.round(perfData.loadEventEnd - perfData.navigationStart)}ms`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
}

// App-Initialisierung mit erweiterten Sicherheitsmaßnahmen
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ KRITISCHER FEHLER: Root-Element nicht gefunden!');
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: system-ui, sans-serif;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Anwendung konnte nicht geladen werden</h1>
        <p style="color: #6b7280; margin-bottom: 2rem;">Das Root-Element wurde nicht gefunden.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
          Seite neu laden
        </button>
      </div>
    `;
    return;
  }

  try {
    console.log('🚀 Initialisiere React-Anwendung...');
    
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-xl font-bold text-red-600 mb-4">
                Systemfehler
              </h1>
              
              <p className="text-gray-600 mb-6">
                Die Anwendung konnte nicht korrekt geladen werden. Dies liegt möglicherweise an einem Verbindungsproblem zum Backend.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Seite neu laden
                </button>
                
                <details className="text-left">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    Lösungsvorschläge anzeigen
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                    <ul className="space-y-1">
                      <li>• Backend starten: <code>dotnet run</code></li>
                      <li>• Frontend neu starten: <code>npm run dev</code></li>
                      <li>• Browser-Cache leeren (Strg+F5)</li>
                      <li>• Proxy-Konfiguration prüfen</li>
                      <li>• Browser-Konsole auf Fehler prüfen (F12)</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </div>
        }>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ErrorBoundary fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="bg-white p-8 rounded-lg border border-amber-200 text-center max-w-md">
                    <h2 className="text-lg font-semibold text-amber-800 mb-4">Routing-Fehler</h2>
                    <p className="text-amber-700 mb-4">Es gab ein Problem beim Laden der Seite.</p>
                    <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                      Zurück zum Dashboard
                    </a>
                  </div>
                </div>
              }>
                <App />
              </ErrorBoundary>
            </BrowserRouter>
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    );
    
    console.log('✅ React-Anwendung erfolgreich initialisiert');
    
  } catch (error) {
    console.error('❌ Kritischer Fehler bei App-Initialisierung:', error);
    
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: system-ui, sans-serif; background: #f9fafb;">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; text-align: center; max-width: 400px;">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">
            Kritischer Systemfehler
          </h1>
          <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.5;">
            Die Anwendung konnte nicht gestartet werden. Bitte kontaktieren Sie den Administrator oder versuchen Sie es später erneut.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
              Neu laden
            </button>
            <button onclick="console.log('Error Details:', ${JSON.stringify(error)})" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">
              Debug-Info
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// App-Start mit DOM-Ready-Check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}