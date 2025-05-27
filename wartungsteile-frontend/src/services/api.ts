// src/services/api.ts - REPARIERTE VERSION
import axios from 'axios';

// ✅ KORRIGIERT: Proxy-URL verwenden statt direkte Backend-URL
export const API_BASE_URL = '/api'; // Nutzt Vite-Proxy

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout hinzufügen für bessere User Experience
  timeout: 10000,
});

// Request Interceptor für Debug-Logging
api.interceptors.request.use(
  config => {
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor für Debug-Logging und Fehlerbehandlung
api.interceptors.response.use(
  response => {
    console.log('✅ API Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers,
      timeout: error.code === 'ECONNABORTED' && error.message.includes('timeout')
    });
    
    // Spezielle Fehlerbehandlung
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('⏱️ Timeout Error - Request took too long');
      error.message = 'Die Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('🌐 Network Error - Backend möglicherweise nicht erreichbar!');
      console.error('   1. Läuft das Backend? (dotnet run)');
      console.error('   2. Backend-Port: https://localhost:7024');
      console.error('   3. Frontend-Port: http://localhost:3000');
      error.message = 'Backend nicht erreichbar. Prüfen Sie ob das Backend läuft.';
    } else if (error.response?.status === 400) {
      console.error('📝 Bad Request - Datenvalidierung fehlgeschlagen');
    } else if (error.response?.status === 404) {
      console.error('🔍 Not Found - Endpoint existiert nicht');
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server Error - Backend-Problem');
    }
    
    return Promise.reject(error);
  }
);

// Backend-Status prüfen (aktualisiert)
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    console.log('🔍 Prüfe Backend-Status über Proxy...');
    const response = await api.get('/Machines', { timeout: 5000 });
    console.log('✅ Backend ist über Proxy erreichbar!', response.status);
    return true;
  } catch (error: any) {
    console.error('❌ Backend nicht über Proxy erreichbar!');
    console.error('   Error:', error.message);
    
    // Zusätzlicher Check: Direkte Verbindung testen
    try {
      console.log('🔍 Teste direkte Backend-Verbindung...');
      await axios.get('https://localhost:7024/api/Machines', {
        timeout: 3000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('✅ Backend läuft, aber Proxy-Problem!');
      console.error('   LÖSUNG: Verwende /api statt https://localhost:7024/api');
      return false;
    } catch (directError) {
      console.error('❌ Backend läuft nicht oder ist nicht erreichbar');
      return false;
    }
  }
};