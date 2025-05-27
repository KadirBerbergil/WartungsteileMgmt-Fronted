// src/services/api.ts - Verbesserte und robuste API-Service
import axios from 'axios';

// ✅ Proxy-URL verwenden statt direkte Backend-URL
export const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 Sekunden Timeout
});

// Request Interceptor für Debug-Logging und Validierung
api.interceptors.request.use(
  config => {
    // Validierung der URL-Parameter
    if (config.url?.includes('undefined') || config.url?.includes('null')) {
      console.error('❌ KRITISCHER FEHLER: Ungültige URL mit undefined/null:', config.url);
      throw new Error(`Ungültige API-URL: ${config.url}`);
    }

    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data ? 'Daten vorhanden' : 'Keine Daten',
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  error => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor für Debug-Logging und erweiterte Fehlerbehandlung
api.interceptors.response.use(
  response => {
    console.log('✅ API Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataSize: response.data ? (Array.isArray(response.data) ? `${response.data.length} Elemente` : 'Objekt') : 'Keine Daten',
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  error => {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };

    console.error('❌ API Error Details:', errorDetails);
    
    // Spezielle Fehlerbehandlung mit benutzerfreundlichen Meldungen
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('⏱️ Timeout Error - Request took too long');
      error.userMessage = 'Die Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.';
      error.category = 'TIMEOUT';
    } 
    else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('🌐 Network Error - Backend möglicherweise nicht erreichbar!');
      console.error('💡 Lösungsvorschläge:');
      console.error('   1. Läuft das Backend? (dotnet run)');
      console.error('   2. Backend-Port: https://localhost:7024');
      console.error('   3. Frontend-Port: http://localhost:3000');
      console.error('   4. Proxy-Konfiguration prüfen');
      
      error.userMessage = 'Backend nicht erreichbar. Bitte prüfen Sie die Verbindung.';
      error.category = 'NETWORK';
    }
    else if (error.response?.status === 400) {
      console.error('📝 Bad Request (400) - Datenvalidierung fehlgeschlagen');
      error.userMessage = 'Ungültige Daten. Bitte prüfen Sie Ihre Eingaben.';
      error.category = 'VALIDATION';
    }
    else if (error.response?.status === 401) {
      console.error('🔐 Unauthorized (401) - Keine Berechtigung');
      error.userMessage = 'Keine Berechtigung für diese Aktion.';
      error.category = 'AUTH';
    }
    else if (error.response?.status === 403) {
      console.error('🚫 Forbidden (403) - Zugriff verweigert');
      error.userMessage = 'Zugriff verweigert.';
      error.category = 'AUTH';
    }
    else if (error.response?.status === 404) {
      console.error('🔍 Not Found (404) - Ressource existiert nicht');
      
      // Spezielle Behandlung für verschiedene 404-Fälle
      if (error.config?.url?.includes('/Machines/')) {
        error.userMessage = 'Die angeforderte Maschine wurde nicht gefunden.';
      } else if (error.config?.url?.includes('/MaintenanceParts/')) {
        error.userMessage = 'Das angeforderte Wartungsteil wurde nicht gefunden.';
      } else {
        error.userMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
      }
      
      error.category = 'NOT_FOUND';
    }
    else if (error.response?.status === 409) {
      console.error('⚡ Conflict (409) - Datenkonflikt');
      error.userMessage = 'Datenkonflikt. Die Ressource wurde möglicherweise bereits geändert.';
      error.category = 'CONFLICT';
    }
    else if (error.response?.status >= 500) {
      console.error('🔥 Server Error (>=500) - Backend-Problem');
      error.userMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
      error.category = 'SERVER';
    }
    else {
      console.error('❓ Unbekannter Fehler');
      error.userMessage = 'Ein unbekannter Fehler ist aufgetreten.';
      error.category = 'UNKNOWN';
    }

    // Zusätzliche Debug-Informationen für Development
    if (import.meta.env.DEV) {
      console.group('🔍 Erweiterte Debug-Informationen');
      console.log('Request Config:', error.config);
      console.log('Response Data:', error.response?.data);
      console.log('Response Headers:', error.response?.headers);
      console.groupEnd();
    }
    
    return Promise.reject(error);
  }
);

// Backend-Status prüfen (verbessert)
export const checkBackendStatus = async (): Promise<{
  isReachable: boolean;
  responseTime: number;
  error?: string;
  proxyWorking: boolean;
  backendDirectly: boolean;
}> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Prüfe Backend-Status über Proxy...');
    
    // Test 1: Über Proxy (bevorzugt)
    const response = await api.get('/Machines', { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Backend ist über Proxy erreichbar!', response.status);
    
    return {
      isReachable: true,
      responseTime,
      proxyWorking: true,
      backendDirectly: false
    };
    
  } catch (proxyError: any) {
    console.error('❌ Backend nicht über Proxy erreichbar:', proxyError.message);
    
    // Test 2: Direkte Verbindung als Fallback
    try {
      console.log('🔍 Teste direkte Backend-Verbindung...');
      
      const directResponse = await axios.get('https://localhost:7024/api/Machines', {
        timeout: 3000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const responseTime = Date.now() - startTime;
      
      console.log('⚠️ Backend läuft, aber Proxy-Problem!');
      console.error('💡 LÖSUNG: API-Konfiguration auf /api ändern');
      
      return {
        isReachable: true,
        responseTime,
        proxyWorking: false,
        backendDirectly: true,
        error: 'Backend erreichbar, aber Proxy-Konfiguration fehlerhaft'
      };
      
    } catch (directError: any) {
      console.error('❌ Backend auch direkt nicht erreichbar');
      
      const responseTime = Date.now() - startTime;
      
      return {
        isReachable: false,
        responseTime,
        proxyWorking: false,
        backendDirectly: false,
        error: `Backend nicht erreichbar: ${directError.message}`
      };
    }
  }
};

// Erweiterte Utility-Funktionen
export const apiUtils = {
  // Sichere Parameter-Validierung
  validateId: (id: string | undefined, resourceType: string = 'Ressource'): string => {
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      throw new Error(`Ungültige ${resourceType}-ID: ${id}`);
    }
    return id.trim();
  },

  // Sichere URL-Erstellung
  buildUrl: (base: string, ...segments: (string | number | undefined)[]): string => {
    const validSegments = segments
      .filter(segment => segment !== undefined && segment !== null && segment !== '')
      .map(segment => String(segment).trim());
    
    if (validSegments.some(segment => segment === 'undefined' || segment === 'null')) {
      throw new Error(`Ungültige URL-Segmente: [${segments.join(', ')}]`);
    }
    
    return [base, ...validSegments].join('/');
  },

  // Error-Handler für React Query
  handleApiError: (error: any, context: string) => {
    console.error(`❌ ${context}:`, error);
    
    // Für UI: Benutzerfreundliche Fehlermeldung zurückgeben
    return {
      message: error.userMessage || error.message || 'Ein Fehler ist aufgetreten',
      category: error.category || 'UNKNOWN',
      status: error.response?.status,
      technical: import.meta.env.DEV ? error.message : undefined
    };
  },

  // Retry-Logic Helper
  shouldRetry: (error: any, attempt: number): boolean => {
    // Bei bestimmten Fehlern nicht wiederholen
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false; // Client-Fehler
    }
    
    // Bei Netzwerk-/Server-Fehlern max. 3 Versuche
    return attempt < 3;
  }
};

// Enhanced Response Types für bessere TypeScript-Unterstützung
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  userMessage?: string;
  category: 'NETWORK' | 'TIMEOUT' | 'VALIDATION' | 'AUTH' | 'NOT_FOUND' | 'CONFLICT' | 'SERVER' | 'UNKNOWN';
  status?: number;
  technical?: string;
}

// Status-Definitionen für bessere Typisierung
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;