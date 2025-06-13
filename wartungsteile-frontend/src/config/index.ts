// src/config/index.ts - KORRIGIERTE VERSION - Robuste Konfiguration
// ✅ KORRIGIERT: Proxy-basierte URLs verwenden

export const API_BASE_URL = '/api'; // Nutzt Vite-Proxy - KORREKT!
export const API_KEY = 'dev-key-123456'; // API Key für Entwicklung

export const ENDPOINTS = {
  MACHINES: `${API_BASE_URL}/Machines`,
  MAINTENANCE_PARTS: `${API_BASE_URL}/MaintenanceParts`,
  COMPATIBILITY: `${API_BASE_URL}/MachinePartCompatibility`,
  MAINTENANCE_PARTS_LIST: `${API_BASE_URL}/MaintenancePartsList`
} as const;

// ✅ NEU: Umgebungs-spezifische Konfiguration
export const CONFIG = {
  // API-Konfiguration
  API: {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 15000, // 15 Sekunden
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 Sekunde
  },
  
  // Frontend-Konfiguration
  FRONTEND: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    AUTO_SAVE_DELAY: 2000, // 2 Sekunden
  },
  
  // UI-Konfiguration
  UI: {
    TOAST_DURATION: 5000, // 5 Sekunden
    LOADING_DEBOUNCE: 300, // 300ms
    SEARCH_DEBOUNCE: 500, // 500ms
  },
  
  // Wartungs-spezifische Konfiguration
  MAINTENANCE: {
    MAX_OPERATING_HOURS_WARNING: 1000,
    MAX_OPERATING_HOURS_CRITICAL: 1500,
    LOW_STOCK_THRESHOLD: 3,
    OUT_OF_STOCK_THRESHOLD: 0,
  },
  
  // Magazin-Eigenschaften Konfiguration
  MAGAZINE_PROPERTIES: {
    TOTAL_FIELDS: 29,
    REQUIRED_FIELDS: ['magazineType', 'materialBarLength', 'feedChannel'],
    COMPLETION_THRESHOLDS: {
      BASIC: 30, // 30% für grundlegende Daten
      GOOD: 60,  // 60% für gute Vollständigkeit
      EXCELLENT: 90 // 90% für exzellente Vollständigkeit
    }
  }
} as const;

// Debug-Informationen für Development
export const DEBUG_INFO = {
  FRONTEND_URL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  API_BASE_URL,
  PROXY_TARGET: 'http://localhost:5000',
  EXPECTED_BACKEND: 'http://localhost:5000/api',
  BUILD_MODE: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// ✅ NEU: Validation Helpers
export const VALIDATION = {
  // Maschinen-Validierung
  MACHINE: {
    NUMBER: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
      PATTERN: /^[A-Z0-9\-_]+$/i,
    },
    TYPE: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    OPERATING_HOURS: {
      MIN: 0,
      MAX: 100000,
    }
  },
  
  // Wartungsteile-Validierung
  MAINTENANCE_PART: {
    PART_NUMBER: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 50,
      PATTERN: /^[A-Z0-9\-_\s]+$/i,
    },
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 200,
    },
    PRICE: {
      MIN: 0.01,
      MAX: 999999.99,
    },
    STOCK: {
      MIN: 0,
      MAX: 999999,
    }
  },
  
  // Magazin-Eigenschaften Validierung
  MAGAZINE: {
    MATERIAL_BAR_LENGTH: {
      MIN: 0,
      MAX: 10000, // 10 Meter in mm
    },
    PRODUCTION_WEEK: {
      PATTERN: /^\d{1,2}\/\d{4}$/, // KW/Jahr Format
    }
  }
} as const;

// ✅ NEU: Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.',
  TIMEOUT: 'Die Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.',
  SERVER: 'Serverfehler. Bitte versuchen Sie es später erneut.',
  NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  VALIDATION: 'Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.',
  UNAUTHORIZED: 'Keine Berechtigung für diese Aktion.',
  CONFLICT: 'Datenkonflikt. Die Ressource wurde möglicherweise bereits geändert.',
  
  // Spezifische Fehler
  MACHINE_NOT_FOUND: 'Die angeforderte Maschine wurde nicht gefunden.',
  PART_NOT_FOUND: 'Das angeforderte Wartungsteil wurde nicht gefunden.',
  BACKEND_UNREACHABLE: 'Backend nicht erreichbar. Bitte prüfen Sie die Verbindung.',
} as const;

// ✅ NEU: Success Messages
export const SUCCESS_MESSAGES = {
  MACHINE_CREATED: 'Maschine erfolgreich erstellt!',
  MACHINE_UPDATED: 'Maschine erfolgreich aktualisiert!',
  MACHINE_DELETED: 'Maschine erfolgreich gelöscht!',
  
  PART_CREATED: 'Wartungsteil erfolgreich erstellt!',
  PART_UPDATED: 'Wartungsteil erfolgreich aktualisiert!',
  PART_DELETED: 'Wartungsteil erfolgreich gelöscht!',
  
  MAINTENANCE_COMPLETED: 'Wartung erfolgreich durchgeführt!',
  MAGAZINE_PROPERTIES_UPDATED: 'Magazin-Eigenschaften erfolgreich aktualisiert!',
} as const;

// ✅ NEU: Utility Functions
export const getApiUrl = (endpoint: keyof typeof ENDPOINTS): string => {
  return ENDPOINTS[endpoint];
};

export const isValidMachineNumber = (number: string): boolean => {
  if (!number) return false;
  return (
    number.length >= VALIDATION.MACHINE.NUMBER.MIN_LENGTH &&
    number.length <= VALIDATION.MACHINE.NUMBER.MAX_LENGTH &&
    VALIDATION.MACHINE.NUMBER.PATTERN.test(number)
  );
};

export const isValidPartNumber = (partNumber: string): boolean => {
  if (!partNumber) return false;
  return (
    partNumber.length >= VALIDATION.MAINTENANCE_PART.PART_NUMBER.MIN_LENGTH &&
    partNumber.length <= VALIDATION.MAINTENANCE_PART.PART_NUMBER.MAX_LENGTH &&
    VALIDATION.MAINTENANCE_PART.PART_NUMBER.PATTERN.test(partNumber)
  );
};

export const isValidPrice = (price: number): boolean => {
  return (
    price >= VALIDATION.MAINTENANCE_PART.PRICE.MIN &&
    price <= VALIDATION.MAINTENANCE_PART.PRICE.MAX
  );
};

export const getStockStatus = (quantity: number): 'outOfStock' | 'lowStock' | 'inStock' => {
  if (quantity <= CONFIG.MAINTENANCE.OUT_OF_STOCK_THRESHOLD) return 'outOfStock';
  if (quantity <= CONFIG.MAINTENANCE.LOW_STOCK_THRESHOLD) return 'lowStock';
  return 'inStock';
};

export const getMagazineCompletionLevel = (completeness: number): 'poor' | 'basic' | 'good' | 'excellent' => {
  if (completeness < CONFIG.MAGAZINE_PROPERTIES.COMPLETION_THRESHOLDS.BASIC) return 'poor';
  if (completeness < CONFIG.MAGAZINE_PROPERTIES.COMPLETION_THRESHOLDS.GOOD) return 'basic';
  if (completeness < CONFIG.MAGAZINE_PROPERTIES.COMPLETION_THRESHOLDS.EXCELLENT) return 'good';
  return 'excellent';
};

// ✅ Development Helpers
if (import.meta.env.DEV) {
  console.log('🔧 Wartungsteile Frontend Configuration:', {
    ...DEBUG_INFO,
    endpoints: ENDPOINTS,
    config: CONFIG
  });
  
  // Validiere Konfiguration
  if (!API_BASE_URL.startsWith('/')) {
    console.warn('⚠️ API_BASE_URL sollte mit "/" beginnen für Proxy-Support');
  }
  
  if (API_BASE_URL.includes('localhost:7024')) {
    console.warn('⚠️ API_BASE_URL enthält direkte Backend-URL - sollte Proxy verwenden');
  }
}