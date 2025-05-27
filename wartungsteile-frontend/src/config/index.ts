// src/config/index.ts - REPARIERTE VERSION
// ✅ KORRIGIERT: Proxy-basierte URLs verwenden

export const API_BASE_URL = '/api'; // Nutzt Vite-Proxy

export const ENDPOINTS = {
  MACHINES: `${API_BASE_URL}/Machines`,
  MAINTENANCE_PARTS: `${API_BASE_URL}/MaintenanceParts`,
  COMPATIBILITY: `${API_BASE_URL}/MachinePartCompatibility`,
  MAINTENANCE_PARTS_LIST: `${API_BASE_URL}/MaintenancePartsList`,
  PDF_EXTRACT: `${API_BASE_URL}/Pdf`
};

// Debug-Informationen
export const DEBUG_INFO = {
  FRONTEND_URL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  API_BASE_URL,
  PROXY_TARGET: 'https://localhost:7024',
  EXPECTED_BACKEND: 'https://localhost:7024/api'
};