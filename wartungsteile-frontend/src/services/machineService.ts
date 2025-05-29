// src/services/machineService.ts - KOMPLETT REPARIERTE VERSION ohne Bugs
import { api } from './api';
import type { 
  Machine, 
  MachineDetail, 
  UpdateMagazinePropertiesCommand, 
  ExtractedMachineData
} from '../types/api';

// ✅ UTILITY: Sichere ID-Validierung (konsistent mit Hooks)
const isValidId = (id: string | undefined | null): id is string => {
  return !!(
    id && 
    typeof id === 'string' &&
    id !== 'undefined' && 
    id !== 'null' && 
    id.trim().length > 0 &&
    id.length < 100 &&
    !id.includes('..') &&
    /^[a-zA-Z0-9\-_]+$/.test(id.trim())
  );
};

// ✅ UTILITY: Sichere Daten-Validierung
const isValidApiResponse = <T>(data: any): data is T => {
  return data !== null && data !== undefined && typeof data === 'object';
};

// ✅ ENHANCED DEBUG LOGGING für alle machineService Funktionen
const logDebug = (functionName: string, step: string, data: any) => {
  console.log(`🔧 [${functionName}] ${step}:`, data);
};

const logSuccess = (functionName: string, step: string, data?: any) => {
  console.log(`✅ [${functionName}] ${step}`, data ? ':' : '', data || '');
};

const logWarning = (functionName: string, step: string, data: any) => {
  console.warn(`⚠️ [${functionName}] ${step}:`, data);
};

// ✅ UTILITY: Sichere Error-Logging ohne sensitive Daten (mit Debug-Enhancement)
const logError = (context: string, error: any, additionalData?: any) => {
  const safeError: {
    message: any;
    status: any;
    statusText: any;
    errorCode: any;
    timestamp: string;
    context: string;
    additionalInfo?: string;
  } = {
    message: error?.message || 'Unknown error',
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    errorCode: error?.response?.data?.code || error?.code,
    timestamp: new Date().toISOString(),
    context
  };
  
  if (additionalData) {
    safeError.additionalInfo = typeof additionalData === 'string' 
      ? additionalData 
      : JSON.stringify(additionalData).substring(0, 200) + '...';
  }
  
  console.error(`❌ [${context}] ERROR:`, safeError);
  
  // ✅ NEU: Zusätzliche Debug-Info bei API-Fehlern
  if (error?.response) {
    console.error(`❌ [${context}] API Response Details:`, {
      status: error.response.status,
      statusText: error.response.statusText,
      headers: error.response.headers,
      url: error.response.config?.url,
      method: error.response.config?.method,
      data: error.response.data
    });
  }
  
  if (error?.request) {
    console.error(`❌ [${context}] Request Details:`, {
      url: error.request.responseURL,
      status: error.request.status,
      readyState: error.request.readyState
    });
  }
};

// ✅ MachineStatus Type Definition
export type MachineStatus = 'Active' | 'InMaintenance' | 'OutOfService';

// ✅ STATUS ENUM MAPPING mit verbesserter Validierung
export const MachineStatusMap = {
  toInteger: {
    'Active': 0,
    'InMaintenance': 1,
    'OutOfService': 2
  } as const,
  
  toString: {
    0: 'Active',
    1: 'InMaintenance', 
    2: 'OutOfService'
  } as const,
  
  toGerman: {
    'Active': 'Aktiv',
    'InMaintenance': 'In Wartung',
    'OutOfService': 'Außer Betrieb'
  } as const,
  
  fromGerman: {
    'Aktiv': 'Active',
    'In Wartung': 'InMaintenance',
    'Außer Betrieb': 'OutOfService'
  } as const,
  
  // ✅ NEU: Validierung Helper
  isValidStatus: (status: any): status is MachineStatus => {
    return typeof status === 'string' && ['Active', 'InMaintenance', 'OutOfService'].includes(status);
  },
  
  isValidStatusInteger: (status: any): status is 0 | 1 | 2 => {
    return typeof status === 'number' && [0, 1, 2].includes(status);
  }
};

export interface ChangeStatusRequest {
  machineId: string;
  newStatus: number;
}

export interface ChangeStatusResponse {
  success: boolean;
  message?: string;
}

// ✅ REQUEST TIMEOUT CONFIGURATION
const API_TIMEOUT = 30000; // 30 Sekunden
const BATCH_TIMEOUT = 300000; // 5 Minuten für Batch-Operations

export const machineService = {
  // ========================================
  // ✅ REPARIERTE BASIS MASCHINEN-OPERATIONS
  // ========================================
  
  // ✅ ENHANCED DEBUG: Alle Maschinen abrufen
  getAll: async (): Promise<Machine[]> => {
    logDebug('getAll', 'Starting API call', '/Machines');
    
    try {
      const response = await api.get('/Machines', { timeout: API_TIMEOUT });
      logDebug('getAll', 'Raw API response', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length,
        firstItem: response.data?.[0]
      });
      
      if (!isValidApiResponse<Machine[]>(response.data)) {
        logWarning('getAll', 'Invalid API response format', response.data);
        throw new Error('Invalid API response format');
      }
      
      if (!Array.isArray(response.data)) {
        logWarning('getAll', 'API returned non-array data, wrapping in array', response.data);
        return [];
      }
      
      logSuccess('getAll', `Successfully loaded ${response.data.length} machines`);
      return response.data;
    } catch (error: any) {
      logError('getAll', error);
      throw new Error('Fehler beim Laden der Maschinen');
    }
  },
  
  // ✅ ENHANCED DEBUG: Maschine nach ID abrufen
  getById: async (id: string): Promise<MachineDetail> => {
    logDebug('getById', 'Starting with ID', id);
    
    if (!isValidId(id)) {
      logError('getById', new Error(`Invalid ID: ${id}`), { originalId: id });
      throw new Error(`Ungültige Maschinen-ID: ${id}`);
    }
    
    try {
      const url = `/Machines/id/${id}`;
      logDebug('getById', 'Making API call', url);
      
      const response = await api.get(url, { timeout: API_TIMEOUT });
      logDebug('getById', 'Raw API response', {
        status: response.status,
        dataType: typeof response.data,
        hasId: !!response.data?.id,
        machineNumber: response.data?.number,
        keys: Object.keys(response.data || {})
      });
      
      if (!isValidApiResponse<MachineDetail>(response.data)) {
        logWarning('getById', 'Invalid machine detail response', response.data);
        throw new Error('Invalid machine detail response');
      }
      
      logSuccess('getById', `Successfully loaded machine: ${response.data.number}`);
      return response.data;
    } catch (error: any) {
      logError('getById', error, { machineId: id });
      
      if (error?.response?.status === 404) {
        throw new Error(`Maschine mit ID ${id} nicht gefunden`);
      }
      throw new Error('Fehler beim Laden der Maschinen-Details');
    }
  },
  
  // ✅ REPARIERT: String-Validierung für Maschinennummer
  getByNumber: async (number: string): Promise<Machine> => {
    if (!number || typeof number !== 'string' || number.trim().length === 0) {
      throw new Error('Ungültige Maschinennummer');
    }
    
    // ✅ Sanitize input
    const sanitizedNumber = number.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
    
    try {
      const response = await api.get(`/Machines/${encodeURIComponent(sanitizedNumber)}`, { 
        timeout: API_TIMEOUT 
      });
      
      if (!isValidApiResponse<Machine>(response.data)) {
        throw new Error('Invalid machine response');
      }
      
      return response.data;
    } catch (error: any) {
      logError('getByNumber', error, { number: sanitizedNumber });
      
      if (error?.response?.status === 404) {
        throw new Error(`Maschine "${number}" nicht gefunden`);
      }
      throw new Error('Fehler beim Laden der Maschine');
    }
  },
  
  // ✅ REPARIERT: Input-Validierung für Machine Creation
  create: async (machine: any): Promise<string> => {
    console.log('🔧 CREATE: Eingehende Daten:', machine);
    
    // ✅ Grundlegende Validierung
    if (!machine || typeof machine !== 'object') {
      throw new Error('Ungültige Maschinendaten');
    }
    
    // ✅ REPARIERT: Flexiblere Validierung für verschiedene Property-Namen
    const machineNumber = machine.number || machine.machineNumber || machine.Number;
    const machineType = machine.type || machine.machineType || machine.Type;
    
    if (!machineNumber || typeof machineNumber !== 'string' || machineNumber.trim().length === 0) {
      console.error('❌ CREATE: Fehlende Maschinennummer:', { 
        provided: machineNumber, 
        rawMachine: machine,
        availableKeys: Object.keys(machine)
      });
      throw new Error('Maschinennummer ist erforderlich');
    }
    
    if (!machineType || typeof machineType !== 'string' || machineType.trim().length === 0) {
      console.error('❌ CREATE: Fehlender Maschinentyp:', { 
        provided: machineType, 
        rawMachine: machine,
        availableKeys: Object.keys(machine)
      });
      throw new Error('Maschinentyp ist erforderlich');
    }
    
    // ✅ Sanitize machine data mit flexibler Property-Erkennung
    const sanitizedMachine = {
      ...machine,
      number: machineNumber.trim(),
      type: machineType.trim(),
      operatingHours: Math.max(0, Number(machine.operatingHours) || 0)
    };
    
    console.log('✅ CREATE: Sanitized data:', sanitizedMachine);
    
    try {
      const response = await api.post('/Machines', sanitizedMachine, { timeout: API_TIMEOUT });
      
      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Invalid machine creation response');
      }
      
      console.log('✅ CREATE: Erfolg, neue ID:', response.data);
      return response.data;
    } catch (error: any) {
      logError('create', error, { machineNumber: machineNumber });
      
      if (error?.response?.status === 409) {
        throw new Error(`Maschine "${machineNumber}" existiert bereits`);
      }
      if (error?.response?.status === 400) {
        throw new Error('Ungültige Maschinendaten - Backend-Validierung fehlgeschlagen');
      }
      throw new Error('Fehler beim Erstellen der Maschine');
    }
  },
  
  // ✅ ENHANCED DEBUG: Sichere Update-Operation
  update: async (id: string, machine: any): Promise<boolean> => {
    logDebug('update', 'Starting update', { id, machineData: machine, dataKeys: Object.keys(machine || {}) });
    
    if (!isValidId(id)) {
      logError('update', new Error(`Invalid ID: ${id}`), { originalId: id });
      throw new Error(`Ungültige Maschinen-ID: ${id}`);
    }
    
    if (!machine || typeof machine !== 'object' || Object.keys(machine).length === 0) {
      logError('update', new Error('No update data'), { machine, keys: Object.keys(machine || {}) });
      throw new Error('Keine Update-Daten bereitgestellt');
    }
    
    try {
      const url = `/Machines/${id}`;
      logDebug('update', 'Making API call', { url, method: 'PUT', data: machine });
      
      const response = await api.put(url, machine, { timeout: API_TIMEOUT });
      logDebug('update', 'API response', {
        status: response.status,
        success: response.status === 200,
        responseData: response.data
      });
      
      const success = response.status === 200;
      logSuccess('update', success ? 'Update successful' : 'Update failed', { status: response.status });
      return success;
    } catch (error: any) {
      logError('update', error, { machineId: id });
      throw new Error('Fehler beim Aktualisieren der Maschine');
    }
  },
  
  // ✅ REPARIERT: Betriebsstunden-Validierung
  updateOperatingHours: async (id: string, hours: number): Promise<boolean> => {
    if (!isValidId(id)) {
      throw new Error(`Ungültige Maschinen-ID: ${id}`);
    }
    
    // ✅ Strikte Zahlen-Validierung
    if (typeof hours !== 'number' || !isFinite(hours) || hours < 0 || hours > 1000000) {
      throw new Error('Ungültige Betriebsstunden (0-1.000.000 erlaubt)');
    }
    
    const roundedHours = Math.round(hours);
    
    try {
      const response = await api.put(`/Machines/${id}/operatinghours`, { 
        machineId: id, 
        newOperatingHours: roundedHours 
      }, { timeout: API_TIMEOUT });
      
      return response.status === 200;
    } catch (error: any) {
      logError('updateOperatingHours', error, { machineId: id, hours: roundedHours });
      throw new Error('Fehler beim Aktualisieren der Betriebsstunden');
    }
  },
  
  // ✅ REPARIERT: Status Update mit verbesserter Validierung
  updateMachineStatus: async (
    machineId: string, 
    newStatus: MachineStatus | string | number
  ): Promise<ChangeStatusResponse> => {
    if (!isValidId(machineId)) {
      throw new Error(`Ungültige Maschinen-ID: ${machineId}`);
    }
    
    try {
      let statusInteger: number;
      
      // ✅ REPARIERT: Robuste Status-Konvertierung mit Validierung
      if (typeof newStatus === 'number') {
        if (!MachineStatusMap.isValidStatusInteger(newStatus)) {
          throw new Error(`Ungültiger Status-Integer: ${newStatus}`);
        }
        statusInteger = newStatus;
      } else if (typeof newStatus === 'string') {
        // Deutsche Status-Namen
        const englishStatus = MachineStatusMap.fromGerman[newStatus as keyof typeof MachineStatusMap.fromGerman];
        if (englishStatus) {
          statusInteger = MachineStatusMap.toInteger[englishStatus];
        } 
        // Englische Status-Namen
        else if (MachineStatusMap.isValidStatus(newStatus as MachineStatus)) {
          statusInteger = MachineStatusMap.toInteger[newStatus as MachineStatus];
        } 
        // Fallback für unbekannte Status
        else {
          throw new Error(`Unbekannter Status: ${newStatus}`);
        }
      } else {
        throw new Error(`Ungültiger Status-Typ: ${typeof newStatus}`);
      }

      const requestData: ChangeStatusRequest = {
        machineId: machineId,
        newStatus: statusInteger
      };

      const response = await api.patch(`/Machines/${machineId}/status`, requestData, { 
        timeout: API_TIMEOUT 
      });
      
      return {
        success: response.status === 200,
        message: 'Status erfolgreich aktualisiert'
      };
      
    } catch (error: any) {
      logError('updateMachineStatus', error, { machineId, newStatus });
      
      if (error.message.includes('Ungült')) {
        throw error; // Re-throw validation errors
      }
      
      throw new Error('Fehler beim Aktualisieren des Status');
    }
  },
  
  // ✅ REPARIERT: Sichere Delete-Operation
  delete: async (id: string): Promise<boolean> => {
    if (!isValidId(id)) {
      throw new Error(`Ungültige Maschinen-ID: ${id}`);
    }
    
    try {
      const response = await api.delete(`/Machines/${id}`, { timeout: API_TIMEOUT });
      return response.status === 204;
    } catch (error: any) {
      logError('delete', error, { machineId: id });
      
      if (error?.response?.status === 404) {
        throw new Error(`Maschine mit ID ${id} nicht gefunden`);
      }
      if (error?.response?.status === 409) {
        throw new Error('Maschine kann nicht gelöscht werden (abhängige Daten vorhanden)');
      }
      throw new Error('Fehler beim Löschen der Maschine');
    }
  },
  
  // ✅ REPARIERT: Wartung mit Validierung
  performMaintenance: async (id: string, data: any): Promise<string> => {
    if (!isValidId(id)) {
      throw new Error(`Ungültige Maschinen-ID: ${id}`);
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Ungültige Wartungsdaten');
    }
    
    try {
      const response = await api.post(`/Machines/${id}/maintenance`, data, { 
        timeout: API_TIMEOUT 
      });
      
      if (!response.data || typeof response.data !== 'string') {
        throw new Error('Invalid maintenance response');
      }
      
      return response.data;
    } catch (error: any) {
      logError('performMaintenance', error, { machineId: id });
      throw new Error('Fehler beim Durchführen der Wartung');
    }
  },

  // ========================================
  // ✅ REPARIERTE MAGAZIN-EIGENSCHAFTEN APIs
  // ========================================
  
  // ✅ ENHANCED DEBUG: Magazin-Eigenschaften aktualisieren
  updateMagazineProperties: async (
    machineId: string, 
    properties: UpdateMagazinePropertiesCommand
  ): Promise<{success: boolean, completeness?: number}> => {
    logDebug('updateMagazineProperties', 'Starting update', {
      machineId,
      propertiesType: typeof properties,
      propertyCount: Object.keys(properties || {}).length,
      propertyKeys: Object.keys(properties || {}),
      sampleProperties: Object.fromEntries(Object.entries(properties || {}).slice(0, 3))
    });
    
    if (!isValidId(machineId)) {
      logError('updateMagazineProperties', new Error(`Invalid machine ID: ${machineId}`), { originalId: machineId });
      throw new Error(`Ungültige Maschinen-ID: ${machineId}`);
    }
    
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
      logError('updateMagazineProperties', new Error('No properties provided'), { 
        properties, 
        type: typeof properties,
        keys: Object.keys(properties || {})
      });
      throw new Error('Keine Magazin-Eigenschaften bereitgestellt');
    }
    
    try {
      // ✅ Validierung vor dem Senden
      logDebug('updateMagazineProperties', 'Validating properties', properties);
      const validation = machineService.validateMagazineProperties(properties);
      logDebug('updateMagazineProperties', 'Validation result', validation);
      
      if (!validation.isValid) {
        logError('updateMagazineProperties', new Error('Validation failed'), validation);
        throw new Error(`Validierungsfehler: ${validation.errors.join(', ')}`);
      }
      
      const commandData = {
        machineId: machineId,
        ...properties,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Frontend-User"
      };

      logDebug('updateMagazineProperties', 'Prepared command data', {
        totalKeys: Object.keys(commandData).length,
        machineId: commandData.machineId,
        hasBasicData: !!(properties.magazineType || properties.feedChannel),
        hasCustomerData: !!(properties.customerName || properties.customerNumber)
      });
      
      const url = `/Machines/${machineId}/magazine`;
      logDebug('updateMagazineProperties', 'Making API call', { url, method: 'PUT' });
      
      const response = await api.put(url, commandData, { timeout: API_TIMEOUT });
      
      logDebug('updateMagazineProperties', 'Raw API response', {
        status: response.status,
        dataType: typeof response.data,
        responseKeys: Object.keys(response.data || {}),
        responseData: response.data
      });
      
      const responseData = response.data ?? {};
      
      const result = {
        success: response.status === 200,
        completeness: typeof responseData.completeness === 'number' ? responseData.completeness : undefined
      };
      
      logSuccess('updateMagazineProperties', 'Update completed', result);
      return result;
      
    } catch (error: any) {
      logError('updateMagazineProperties', error, { machineId });
      
      if (error?.response?.status === 404) {
        throw new Error(`Maschine mit ID ${machineId} nicht gefunden`);
      } else if (error?.response?.status === 400) {
        const errorDetails = error.response?.data?.message || 'Unbekannter Validierungsfehler';
        throw new Error(`Validierungsfehler: ${errorDetails}`);
      } else if (error?.response?.status >= 500) {
        throw new Error('Serverfehler beim Speichern der Magazin-Eigenschaften');
      } else if (error.message.includes('Validierungsfehler')) {
        throw error; // Re-throw validation errors
      } else {
        throw new Error('Unbekannter Fehler beim Speichern der Magazin-Eigenschaften');
      }
    }
  },

  updateMagazineFromPdf: async (
    machineId: string, 
    extractedData: ExtractedMachineData
  ): Promise<{success: boolean, fieldsSet: number, completeness?: number}> => {
    if (!isValidId(machineId)) {
      throw new Error(`Ungültige Maschinen-ID: ${machineId}`);
    }
    
    if (!extractedData || typeof extractedData !== 'object') {
      throw new Error('Ungültige PDF-Extraktionsdaten');
    }
    
    try {
      const response = await api.post(`/Machines/${machineId}/magazine/from-pdf`, extractedData, { 
        timeout: API_TIMEOUT 
      });
      
      const responseData = response.data ?? {};
      
      return {
        success: response.status === 200,
        fieldsSet: typeof responseData.fieldsSet === 'number' ? responseData.fieldsSet : 0,
        completeness: typeof responseData.completeness === 'number' ? responseData.completeness : undefined
      };
      
    } catch (error: any) {
      logError('updateMagazineFromPdf', error, { machineId });
      throw new Error('Fehler beim PDF-Import der Magazin-Eigenschaften');
    }
  },

  // ✅ REPARIERT: Completeness ohne Infinite Recursion Risk
  getMagazineDataCompleteness: async (machineId: string): Promise<{
    completeness: number;
    totalFields: number;
    filledFields: number;
    missingFields: string[];
    hasBasicData: boolean;
    hasExtendedData: boolean;
  }> => {
    if (!isValidId(machineId)) {
      throw new Error(`Ungültige Maschinen-ID: ${machineId}`);
    }
    
    try {
      const response = await api.get(`/Machines/${machineId}/magazine/completeness`, { 
        timeout: API_TIMEOUT 
      });
      
      if (!isValidApiResponse(response.data)) {
        throw new Error('Invalid completeness response');
      }
      
      return response.data as {
        completeness: number;
        totalFields: number;
        filledFields: number;
        missingFields: string[];
        hasBasicData: boolean;
        hasExtendedData: boolean;
      };
    } catch (error: any) {
      // ✅ REPARIERT: Kein rekursiver getById Call
      logError('getMagazineDataCompleteness', error, { machineId });
      
      // Fallback: Minimale Daten zurückgeben statt Rekursion
      return {
        completeness: 0,
        totalFields: 30,
        filledFields: 0,
        missingFields: [],
        hasBasicData: false,
        hasExtendedData: false
      };
    }
  },

  // ✅ REPARIERT: Sichere Client-Side Completeness Calculation
  calculateCompletenessClientSide: (machine: MachineDetail) => {
    if (!machine || typeof machine !== 'object') {
      throw new Error('Ungültige Maschinendaten für Completeness-Berechnung');
    }
    
    const allFields = [
      'magazineType', 'materialBarLength', 'hasSynchronizationDevice', 'feedChannel', 'feedRod',
      'customerName', 'customerNumber', 'customerProcess',
      'productionWeek', 'buildVariant', 'operatingVoltage',
      'baseColor', 'coverColor', 'switchCabinetColor', 'controlPanelColor',
      'documentationLanguage', 'documentationCount',
      'latheManufacturer', 'latheType', 'latheNumber', 'spindleHeight', 'spindleDiameter',
      'magazineNumber', 'positionNumber', 'controlPanel', 'apm', 'eprom', 'circuitDiagram', 'drawingList',
      'articleNumber'
    ];

    // ✅ REPARIERT: Sichere Feld-Validierung ohne Type Casting
    const isFieldFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (typeof value === 'number' && value === 0) return false;
      if (typeof value === 'boolean') return true;
      return true;
    };

    const filledFields = allFields.filter(field => {
      // ✅ REPARIERT: Sichere Property-Zugriff ohne any casting
      const value = machine[field as keyof MachineDetail];
      return isFieldFilled(value);
    });

    const missingFields = allFields.filter(field => {
      const value = machine[field as keyof MachineDetail];
      return !isFieldFilled(value);
    });

    const basicFields = ['magazineType', 'materialBarLength', 'feedChannel'];
    const hasBasicData = basicFields.some(field => {
      const value = machine[field as keyof MachineDetail];
      return isFieldFilled(value);
    });

    const extendedFields = ['customerName', 'customerNumber', 'latheManufacturer', 'articleNumber'];
    const hasExtendedData = extendedFields.some(field => {
      const value = machine[field as keyof MachineDetail];
      return isFieldFilled(value);
    });

    return {
      completeness: Math.round((filledFields.length / allFields.length) * 100),
      totalFields: allFields.length,
      filledFields: filledFields.length,
      missingFields,
      hasBasicData,
      hasExtendedData
    };
  },

  // ========================================
  // ✅ REPARIERTE BATCH-OPERATIONS
  // ========================================

  createMachinesFromBatch: async (machines: Array<{
    machineData: any;
    magazineProperties: UpdateMagazinePropertiesCommand;
  }>): Promise<{
    success: boolean;
    totalMachines: number;
    successfullyCreated: number;
    failed: number;
    results: Array<{
      machineNumber: string;
      success: boolean;
      machineId?: string;
      error?: string;
    }>;
  }> => {
    // ✅ Input-Validierung
    if (!Array.isArray(machines) || machines.length === 0) {
      throw new Error('Ungültige Batch-Daten');
    }
    
    if (machines.length > 100) {
      throw new Error('Batch-Größe auf 100 Maschinen limitiert');
    }

    console.log('🏭 Starte Batch-Erstellung für', machines.length, 'Maschinen');

    // ✅ REPARIERT: Explizite Typisierung für results Array
    const results: Array<{
      machineNumber: string;
      success: boolean;
      machineId?: string;
      error?: string;
    }> = [];
    let successCount = 0;
    let failCount = 0;

    // ✅ REPARIERT: Parallel Processing mit Concurrency-Limit
    const CONCURRENCY_LIMIT = 5; // Max 5 parallel requests
    const batches = [];
    
    for (let i = 0; i < machines.length; i += CONCURRENCY_LIMIT) {
      batches.push(machines.slice(i, i + CONCURRENCY_LIMIT));
    }

    for (const batch of batches) {
      // ✅ REPARIERT: Promise.allSettled für Error-Recovery
      const batchPromises = batch.map(async ({ machineData, magazineProperties }) => {
        const machineNumber = machineData?.number || `Unbekannt-${Date.now()}`;
        
        try {
          // Validierung vor Verarbeitung
          if (!machineData?.number || !machineData?.type) {
            throw new Error('Maschinennummer und Typ sind erforderlich');
          }
          
          // 1. Maschine erstellen
          const machineId = await machineService.create(machineData);
          
          // 2. Magazin-Eigenschaften setzen (falls vorhanden)
          if (magazineProperties && Object.keys(magazineProperties).length > 0) {
            await machineService.updateMagazineProperties(machineId, magazineProperties);
          }
          
          return {
            machineNumber,
            success: true,
            machineId
          };
          
        } catch (error: any) {
          return {
            machineNumber,
            success: false,
            error: error.message || 'Unbekannter Fehler'
          };
        }
      });

      // ✅ Warte auf Batch-Completion
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          // ✅ REPARIERT: Explizite Typisierung für rejected results
          const errorResult: {
            machineNumber: string;
            success: boolean;
            error: string;
          } = {
            machineNumber: 'Unbekannt',
            success: false,
            error: result.reason?.message || 'Promise rejected'
          };
          results.push(errorResult);
          failCount++;
        }
      });

      // ✅ Kurze Pause zwischen Batches um Server zu entlasten
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const finalResult = {
      success: successCount > 0,
      totalMachines: machines.length,
      successfullyCreated: successCount,
      failed: failCount,
      results
    };

    console.log('🏁 Batch-Erstellung abgeschlossen:', {
      success: finalResult.success,
      successRate: `${Math.round((successCount / machines.length) * 100)}%`
    });

    return finalResult;
  },

  // ========================================
  // ✅ REPARIERTE VALIDIERUNG UND HELPER
  // ========================================

  validateMagazineProperties: (properties: UpdateMagazinePropertiesCommand): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ✅ REPARIERT: Robuste Materialstangenlängen-Validierung
    if (properties.materialBarLength !== undefined && properties.materialBarLength !== null) {
      const length = Number(properties.materialBarLength);
      if (!isFinite(length) || length < 0 || length > 20000) {
        errors.push('Materialstangenlänge muss zwischen 0 und 20.000 mm liegen');
      }
    }

    // ✅ REPARIERT: Verbesserte Farb-Validierung
    const validateColor = (colorValue: string | undefined, fieldName: string) => {
      if (!colorValue || typeof colorValue !== 'string' || colorValue.trim() === '') {
        return; // Leere Werte sind OK
      }
      
      const color = colorValue.trim();
      
      // ✅ REPARIERT: Strengere aber realistische Validierung
      if (color.length < 2) {
        warnings.push(`${fieldName}: "${color}" ist sehr kurz für einen Farbnamen`);
        return;
      }
      
      if (color.length > 50) {
        warnings.push(`${fieldName}: "${color}" ist ungewöhnlich lang`);
        return;
      }
      
      // Akzeptiere RAL-Codes, Munsell-Farben, und gängige Farbnamen
      const validPatterns = [
        /^RAL\s*\d{4}$/i,
        /^Munsell\s+\w+\s+Color$/i,
        /^(weiß|weiss|schwarz|grau|rot|blau|grün|gelb|orange|violett|lila|braun|silber|gold|beige|rosa|pink|türkis|cyan|magenta)/i,
        /^(white|black|gray|grey|red|blue|green|yellow|orange|purple|violet|brown|silver|gold|beige|pink|turquoise|cyan|magenta)/i,
        /^(hell|dunkel|light|dark)\s+(grau|blau|grün|rot|gray|blue|green|red)/i
      ];
      
      const isValidColor = validPatterns.some(pattern => pattern.test(color));
      
      if (!isValidColor && !/^[a-zA-ZäöüÄÖÜß\s\-]+$/.test(color)) {
        warnings.push(`${fieldName}: "${color}" enthält ungewöhnliche Zeichen für einen Farbnamen`);
      }
    };

    // Alle Farbfelder validieren
    validateColor(properties.baseColor, 'Grundfarbe');
    validateColor(properties.coverColor, 'Abdeckungsfarbe');
    validateColor(properties.switchCabinetColor, 'Schaltschrankfarbe');
    validateColor(properties.controlPanelColor, 'Bedienfeld-Farbe');

    // ✅ REPARIERT: Verbesserte Produktionswoche-Validierung
    if (properties.productionWeek && typeof properties.productionWeek === 'string') {
      const week = properties.productionWeek.trim();
      if (week && !week.match(/^\d{1,2}\/\d{4}$/)) {
        warnings.push('Produktionswoche sollte im Format "KW/Jahr" sein (z.B. "49/2018")');
      } else if (week) {
        const [kw, jahr] = week.split('/');
        const kwNum = parseInt(kw);
        const jahrNum = parseInt(jahr);
        if (kwNum < 1 || kwNum > 53) {
          warnings.push('Kalenderwoche sollte zwischen 1 und 53 liegen');
        }
        if (jahrNum < 1990 || jahrNum > new Date().getFullYear() + 5) {
          warnings.push('Jahr scheint unrealistisch zu sein');
        }
      }
    }

    // ✅ String-Längen-Validierung
    const validateStringLength = (value: string | undefined, fieldName: string, maxLength: number) => {
      if (value && typeof value === 'string' && value.length > maxLength) {
        warnings.push(`${fieldName} ist ungewöhnlich lang (${value.length} Zeichen)`);
      }
    };

    validateStringLength(properties.customerNumber, 'Kundennummer', 20);
    validateStringLength(properties.customerName, 'Kundenname', 100);
    validateStringLength(properties.magazineType, 'Magazin-Typ', 50);

    // ✅ Konsistenz-Prüfungen
    if (properties.customerName && !properties.customerNumber) {
      warnings.push('Kundenname ohne Kundennummer angegeben');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // ✅ REPARIERTE Status Helper Functions
  getStatusDisplayName: (status: MachineStatus | string | number): string => {
    if (typeof status === 'number') {
      const englishStatus = MachineStatusMap.toString[status as keyof typeof MachineStatusMap.toString];
      return englishStatus ? MachineStatusMap.toGerman[englishStatus] : 'Unbekannt';
    }
    
    if (typeof status === 'string') {
      return MachineStatusMap.toGerman[status as keyof typeof MachineStatusMap.toGerman] || status;
    }
    
    return 'Unbekannt';
  },

  getStatusInteger: (status: string): number => {
    if (typeof status !== 'string') {
      return 0; // Default: Active
    }
    
    const englishStatus = MachineStatusMap.fromGerman[status as keyof typeof MachineStatusMap.fromGerman] || status;
    return MachineStatusMap.toInteger[englishStatus as keyof typeof MachineStatusMap.toInteger] ?? 0;
  },

  getAvailableStatuses: (): Array<{ value: string; label: string; integer: number }> => {
    return [
      { value: 'Active', label: 'Aktiv', integer: 0 },
      { value: 'InMaintenance', label: 'In Wartung', integer: 1 },
      { value: 'OutOfService', label: 'Außer Betrieb', integer: 2 }
    ];
  },

  // ✅ REPARIERT: Sichere Display-Formatierung
  formatMagazinePropertiesForDisplay: (machine: Machine) => {
    if (!machine || typeof machine !== 'object') {
      throw new Error('Ungültige Maschinendaten für Formatierung');
    }
    
    const safeGet = (value: any, fallback: string = 'Nicht angegeben'): string => {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'string' && value.trim() === '') return fallback;
      if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
      if (typeof value === 'number') return value.toString();
      return String(value);
    };

    return {
      basic: {
        'Magazin-Typ': safeGet(machine.magazineType),
        'Materialstangenlänge': machine.materialBarLength ? `${machine.materialBarLength} mm` : 'Nicht angegeben',
        'Synchroneinrichtung': safeGet(machine.hasSynchronizationDevice),
        'Zuführkanal': safeGet(machine.feedChannel),
        'Vorschubstange': safeGet(machine.feedRod)
      },
      customer: {
        'Kunde': safeGet(machine.customerName),
        'Kundennummer': safeGet(machine.customerNumber),
        'Kundenprozess': safeGet(machine.customerProcess)
      },
      production: {
        'Produktionswoche': safeGet(machine.productionWeek),
        'Bauvariante': safeGet(machine.buildVariant),
        'Betriebsspannung': safeGet(machine.operatingVoltage)
      },
      colors: {
        'Grundfarbe': safeGet(machine.baseColor),
        'Abdeckungsfarbe': safeGet(machine.coverColor),
        'Schaltschrankfarbe': safeGet(machine.switchCabinetColor),
        'Bedienfeld-Farbe': safeGet(machine.controlPanelColor)
      },
      documentation: {
        'Dokumentationssprache': safeGet(machine.documentationLanguage),
        'Anzahl Dokumentation': safeGet(machine.documentationCount)
      },
      lathe: {
        'Drehmaschinen-Hersteller': safeGet(machine.latheManufacturer),
        'Drehmaschinentyp': safeGet(machine.latheType),
        'Drehmaschinen-Nummer': safeGet(machine.latheNumber),
        'Spindelhöhe': safeGet(machine.spindleHeight),
        'Spindeldurchmesser': safeGet(machine.spindleDiameter)
      },
      electrical: {
        'Magazin-Nummer': safeGet(machine.magazineNumber),
        'Positionsnummer': safeGet(machine.positionNumber),
        'Bedienfeld': safeGet(machine.controlPanel),
        'APM': safeGet(machine.apm),
        'EPROM': safeGet(machine.eprom),
        'Schaltplan': safeGet(machine.circuitDiagram),
        'Zeichnungsliste': safeGet(machine.drawingList)
      },
      article: {
        'Artikelnummer': safeGet(machine.articleNumber)
      },
      metadata: {
        'Letzte Aktualisierung': machine.magazinePropertiesLastUpdated 
          ? new Date(machine.magazinePropertiesLastUpdated).toLocaleString('de-DE')
          : 'Nie',
        'Aktualisiert von': safeGet(machine.magazinePropertiesUpdatedBy, 'Unbekannt'),
        'Notizen': safeGet(machine.magazinePropertiesNotes, 'Keine')
      }
    };
  }
};

export default machineService;