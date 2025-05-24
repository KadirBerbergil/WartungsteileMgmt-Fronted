// src/services/api.ts - Debug Version
import axios from 'axios';

// API-Basiskonfiguration - über Vite-Proxy
export const API_BASE_URL = '/api'; // Proxy zu https://localhost:7024/api

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      headers: error.response?.headers
    });
    
    // Spezielle Fehlerbehandlung
    if (error.code === 'NETWORK_ERROR') {
      console.error('🌐 Network Error - Backend möglicherweise nicht erreichbar!');
      console.error('   1. Läuft das Backend? (dotnet run)');
      console.error('   2. Ist der Vite-Proxy korrekt konfiguriert?');
      console.error('   3. Ist der Port korrekt? (Backend: 7024, Frontend: 3000)');
    } else if (error.response?.status === 400) {
      console.error('📝 Bad Request - Datenvalidierung fehlgeschlagen:');
      console.error('   Request Data:', error.config?.data);
      console.error('   Backend Response:', error.response?.data);
    } else if (error.response?.status === 404) {
      console.error('🔍 Not Found - Endpoint existiert nicht:');
      console.error('   URL:', error.config?.url);
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server Error - Backend-Problem:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

// Backend-Status prüfen
export const checkBackendStatus = async () => {
  try {
    console.log('🔍 Prüfe Backend-Status...');
    const response = await api.get('/Machines');
    console.log('✅ Backend ist erreichbar!', response.status);
    return true;
  } catch (error) {
    console.error('❌ Backend nicht erreichbar!');
    return false;
  }
};