// src/services/api.ts
import axios from 'axios';

// API-Basiskonfiguration - über Vite-Proxy
export const API_BASE_URL = '/api'; // Proxy zu https://localhost:7024/api

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor für Fehlerbehandlung
api.interceptors.response.use(
  response => response,
  error => {
    // Hier können globale Fehlerbehandlungen definiert werden
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);