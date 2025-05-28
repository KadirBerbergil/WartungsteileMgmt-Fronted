// src/services/machineService.ts - Status Update Integration
import { api } from './api';
import type { 
  Machine, 
  MachineDetail, 
  UpdateMagazinePropertiesCommand, 
  ExtractedMachineData
  // ✅ MachineStatus aus Import entfernt - wird als string verwendet
} from '../types/api';

// ✅ MachineStatus Type Definition hier
export type MachineStatus = 'Active' | 'InMaintenance' | 'OutOfService';

// ✅ STATUS ENUM MAPPING - Integer Values
export const MachineStatusMap = {
  // String to Integer (für API Requests)
  toInteger: {
    'Active': 0,
    'InMaintenance': 1,
    'OutOfService': 2
  } as const,
  
  // Integer to String (für UI Display)
  toString: {
    0: 'Active',
    1: 'InMaintenance', 
    2: 'OutOfService'
  } as const,
  
  // German Display Names
  toGerman: {
    'Active': 'Aktiv',
    'InMaintenance': 'In Wartung',
    'OutOfService': 'Außer Betrieb'
  } as const,
  
  // German to English
  fromGerman: {
    'Aktiv': 'Active',
    'In Wartung': 'InMaintenance',
    'Außer Betrieb': 'OutOfService'
  } as const
};

export interface ChangeStatusRequest {
  machineId: string;
  newStatus: number; // ✅ Integer für API
}

export interface ChangeStatusResponse {
  success: boolean;
  message?: string;
}

export const machineService = {
  // ========================================
  // BASIS MASCHINEN-OPERATIONS
  // ========================================
  
  // Alle Maschinen abrufen
  getAll: async (): Promise<Machine[]> => {
    const response = await api.get('/Machines');
    return response.data;
  },
  
  // Maschine nach ID abrufen
  getById: async (id: string): Promise<MachineDetail> => {
    const response = await api.get(`/Machines/id/${id}`);
    return response.data;
  },
  
  // Maschine nach Nummer abrufen
  getByNumber: async (number: string): Promise<Machine> => {
    const response = await api.get(`/Machines/${number}`);
    return response.data;
  },
  
  // Neue Maschine erstellen
  create: async (machine: any): Promise<string> => {
    const response = await api.post('/Machines', machine);
    return response.data;
  },
  
  // Maschine aktualisieren (Basis-Eigenschaften)
  update: async (id: string, machine: any): Promise<boolean> => {
    const response = await api.put(`/Machines/${id}`, machine);
    return response.status === 200;
  },
  
  // Betriebsstunden aktualisieren
  updateOperatingHours: async (id: string, hours: number): Promise<boolean> => {
    const response = await api.put(`/Machines/${id}/operatinghours`, { 
      machineId: id, 
      newOperatingHours: hours 
    });
    return response.status === 200;
  },
  
  // ✅ FIXED: Status Update mit korrekter Integer-Konvertierung
  updateMachineStatus: async (
    machineId: string, 
    newStatus: MachineStatus | string
  ): Promise<ChangeStatusResponse> => {
    try {
      // Status zu Integer konvertieren
      let statusInteger: number;
      
      if (typeof newStatus === 'string') {
        // Falls deutscher Status übergeben wird
        const englishStatus = MachineStatusMap.fromGerman[newStatus as keyof typeof MachineStatusMap.fromGerman];
        if (englishStatus) {
          statusInteger = MachineStatusMap.toInteger[englishStatus];
        } else {
          // Falls englischer Status übergeben wird
          statusInteger = MachineStatusMap.toInteger[newStatus as keyof typeof MachineStatusMap.toInteger];
        }
      } else {
        // Falls bereits Integer
        statusInteger = newStatus as number;
      }

      // Validierung
      if (statusInteger === undefined || ![0, 1, 2].includes(statusInteger)) {
        throw new Error(`Ungültiger Status: ${newStatus}`);
      }

      console.log('🔄 Status Update Request:', {
        machineId,
        originalStatus: newStatus,
        convertedStatus: statusInteger,
        statusName: MachineStatusMap.toString[statusInteger as keyof typeof MachineStatusMap.toString]
      });

      const requestData: ChangeStatusRequest = {
        machineId: machineId,
        newStatus: statusInteger
      };

      const response = await api.patch(`/Machines/${machineId}/status`, requestData);
      
      console.log('✅ Status Update Success:', response.data);
      
      return {
        success: true,
        message: 'Status erfolgreich aktualisiert'
      };
      
    } catch (error: any) {
      console.error('❌ Status Update Error:', {
        machineId,
        newStatus,
        error: error.response?.data || error.message
      });
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        'Fehler beim Aktualisieren des Status'
      );
    }
  },
  
  // Maschine löschen
  delete: async (id: string): Promise<boolean> => {
    const response = await api.delete(`/Machines/${id}`);
    return response.status === 204;
  },
  
  // Wartung durchführen
  performMaintenance: async (id: string, data: any): Promise<string> => {
    const response = await api.post(`/Machines/${id}/maintenance`, data);
    return response.data;
  },


  // ========================================
  // ✨ ERWEITERTE MAGAZIN-EIGENSCHAFTEN APIs
  // ========================================
  
  /**
   * Erweiterte Magazin-Eigenschaften aktualisieren
   * Endpoint: PUT /api/Machines/{machineId}/magazine
   * Unterstützt alle 29+ Werkstattauftrag-Felder
   */
  updateMagazineProperties: async (
    machineId: string, 
    properties: UpdateMagazinePropertiesCommand
  ): Promise<{success: boolean, completeness?: number}> => {
    console.log('🔧 Aktualisiere erweiterte Magazin-Eigenschaften:', {
      machineId,
      propertyCount: Object.keys(properties).length,
      properties
    });
    
    try {
      // ✅ Erstelle vollständiges Command-Objekt mit machineId
      const commandData = {
        machineId: machineId,
        ...properties,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Frontend-User" // TODO: Echten User aus Auth Context nehmen
      };

      console.log('📤 Sende Request:', commandData);
      
      const response = await api.put(`/Machines/${machineId}/magazine`, commandData);
      
      // ✅ Null-Safety: response.data könnte undefined sein
      const responseData = response.data ?? {};
      
      const result = {
        success: response.status === 200,
        completeness: responseData?.completeness ?? undefined
      };
      
      console.log('✅ Magazin-Eigenschaften erfolgreich aktualisiert:', result);
      return result;
      
    } catch (error: any) {
      console.error('❌ Fehler beim Aktualisieren der Magazin-Eigenschaften:', {
        machineId,
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      
      // ✅ Bessere Fehlerbehandlung mit spezifischen Meldungen
      if (error.response?.status === 404) {
        throw new Error(`Maschine mit ID ${machineId} nicht gefunden`);
      } else if (error.response?.status === 400) {
        const errorDetails = error.response?.data?.errors || error.response?.data?.message || 'Unbekannter Validierungsfehler';
        throw new Error(`Validierungsfehler: ${JSON.stringify(errorDetails)}`);
      } else if (error.response?.status >= 500) {
        throw new Error('Serverfehler beim Speichern der Magazin-Eigenschaften');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Unbekannter Fehler beim Speichern');
      }
    }
  },

  /**
   * Magazin-Eigenschaften aus PDF extrahieren und setzen
   * Endpoint: POST /api/Machines/{machineId}/magazine/from-pdf
   * Automatisches Mapping von PDF-ExtractedMachineData zu Magazin-Eigenschaften
   */
  updateMagazineFromPdf: async (
    machineId: string, 
    extractedData: ExtractedMachineData
  ): Promise<{success: boolean, fieldsSet: number, completeness?: number}> => {
    console.log('📄 Setze Magazin-Eigenschaften aus PDF-Extraktion:', {
      machineId,
      extractedFields: Object.keys(extractedData).length,
      extractedData
    });
    
    try {
      const response = await api.post(`/Machines/${machineId}/magazine/from-pdf`, extractedData);
      
      // ✅ Null-Safety: response.data könnte undefined sein
      const responseData = response.data ?? {};
      
      const result = {
        success: response.status === 200,
        fieldsSet: responseData?.fieldsSet ?? 0,
        completeness: responseData?.completeness ?? undefined
      };
      
      console.log('✅ PDF-Import erfolgreich:', result);
      return result;
      
    } catch (error: any) {
      console.error('❌ Fehler beim PDF-Import der Magazin-Eigenschaften:', error);
      throw error;
    }
  },

  /**
   * Vollständigkeit der Magazin-Eigenschaften abrufen
   * Berechnet 0-100% basierend auf ausgefüllten Feldern
   */
  getMagazineDataCompleteness: async (machineId: string): Promise<{
    completeness: number;
    totalFields: number;
    filledFields: number;
    missingFields: string[];
    hasBasicData: boolean;
    hasExtendedData: boolean;
  }> => {
    try {
      const response = await api.get(`/Machines/${machineId}/magazine/completeness`);
      return response.data;
    } catch (error: any) {
      // Fallback: Wenn Endpoint nicht existiert, aus Machine-Daten berechnen
      console.warn('⚠️ Completeness-Endpoint nicht verfügbar, berechne client-seitig');
      const machine = await machineService.getById(machineId);
      return machineService.calculateCompletenessClientSide(machine);
    }
  },

  /**
   * Client-seitige Vollständigkeitsberechnung als Fallback
   */
  calculateCompletenessClientSide: (machine: MachineDetail) => {
    const allFields = [
      // Basis
      'magazineType', 'materialBarLength', 'hasSynchronizationDevice', 'feedChannel', 'feedRod',
      // Kunde
      'customerName', 'customerNumber', 'customerProcess',
      // Produktion
      'productionWeek', 'buildVariant', 'operatingVoltage',
      // Farben
      'baseColor', 'coverColor', 'switchCabinetColor', 'controlPanelColor',
      // Dokumentation
      'documentationLanguage', 'documentationCount',
      // Drehmaschine
      'latheManufacturer', 'latheType', 'latheNumber', 'spindleHeight', 'spindleDiameter',
      // Elektrisch
      'magazineNumber', 'positionNumber', 'controlPanel', 'apm', 'eprom', 'circuitDiagram', 'drawingList',
      // Artikel
      'articleNumber'
    ];

    const filledFields = allFields.filter(field => {
      const value = (machine as any)[field];
      return value !== undefined && value !== null && value !== '';
    });

    const missingFields = allFields.filter(field => {
      const value = (machine as any)[field];
      return value === undefined || value === null || value === '';
    });

    const basicFields = ['magazineType', 'materialBarLength', 'feedChannel'];
    const hasBasicData = basicFields.some(field => {
      const value = (machine as any)[field];
      return value !== undefined && value !== null && value !== '';
    });

    const extendedFields = ['customerName', 'customerNumber', 'latheManufacturer', 'articleNumber'];
    const hasExtendedData = extendedFields.some(field => {
      const value = (machine as any)[field];
      return value !== undefined && value !== null && value !== '';
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
  // BATCH-OPERATIONS (für Enterprise Multi-Upload)
  // ========================================

  /**
   * Mehrere Maschinen auf einmal mit Magazin-Eigenschaften erstellen
   * Für Enterprise PDF-Upload mit 50+ Werkstattaufträgen
   */
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
    console.log('🏭 Starte Batch-Erstellung für', machines.length, 'Maschinen');

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const { machineData, magazineProperties } of machines) {
      try {
        // 1. Maschine erstellen
        const machineId = await machineService.create(machineData);
        
        // 2. Magazin-Eigenschaften setzen
        await machineService.updateMagazineProperties(machineId, magazineProperties);
        
        results.push({
          machineNumber: machineData.number || 'Unbekannt',
          success: true,
          machineId
        });
        successCount++;
        
      } catch (error: any) {
        results.push({
          machineNumber: machineData.number || 'Unbekannt',
          success: false,
          error: error.message
        });
        failCount++;
      }
    }

    return {
      success: successCount > 0,
      totalMachines: machines.length,
      successfullyCreated: successCount,
      failed: failCount,
      results
    };
  },

  // ========================================
  // VALIDIERUNG UND HELPER + STATUS HELPERS
  // ========================================

  /**
   * Magazin-Eigenschaften validieren vor dem Senden
   */
  validateMagazineProperties: (properties: UpdateMagazinePropertiesCommand): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Materialstangenlänge Validierung
    if (properties.materialBarLength !== undefined) {
      if (properties.materialBarLength < 0 || properties.materialBarLength > 10000) {
        errors.push('Materialstangenlänge muss zwischen 0 und 10.000 mm liegen');
      }
    }

    // ✅ NEUE: Benutzerfreundliche Farb-Validierung
    const validateColor = (colorValue: string | undefined, fieldName: string) => {
      if (!colorValue || colorValue.trim() === '') {
        return; // Leere Werte sind OK
      }
      
      const color = colorValue.trim();
      
      // RAL-Codes: RAL 1000, RAL 9016, etc.
      const ralPattern = /^RAL\s*\d{4}$/i;
      
      // Munsell Colors: Munsell Gray Color, Munsell White Color, etc.
      const munsellPattern = /^Munsell\s+\w+\s+Color$/i;
      
      // Deutsche und englische Standardfarben (sehr tolerant)
      const standardColors = [
        // Deutsche Farben
        'weiß', 'weiss', 'schwarz', 'grau', 'rot', 'blau', 'grün', 'gelb',
        'orange', 'violett', 'lila', 'braun', 'silber', 'gold', 'beige',
        'rosa', 'pink', 'türkis', 'cyan', 'magenta', 'hellgrau', 'dunkelgrau',
        'hellblau', 'dunkelblau', 'hellgrün', 'dunkelgrün', 'hellrot', 'dunkelrot',
        
        // Englische Farben
        'white', 'black', 'gray', 'grey', 'red', 'blue', 'green', 'yellow',
        'orange', 'purple', 'violet', 'brown', 'silver', 'gold', 'beige',
        'pink', 'turquoise', 'cyan', 'magenta', 'light gray', 'dark gray',
        'light blue', 'dark blue', 'light green', 'dark green', 'light red', 'dark red'
      ];
      
      // Sehr tolerante Validierung - akzeptiert fast alles was nach Farbe aussieht
      const isValidColor = 
        ralPattern.test(color) || 
        munsellPattern.test(color) ||
        standardColors.some(c => color.toLowerCase().includes(c.toLowerCase())) ||
        color.length >= 3; // Mindestens 3 Zeichen für Farbnamen
      
      if (!isValidColor) {
        warnings.push(`${fieldName}: "${color}" - Bitte verwenden Sie erkennbare Farbnamen, RAL-Codes oder Munsell-Farben.`);
      }
    };

    // Alle Farbfelder validieren
    validateColor(properties.baseColor, 'Grundfarbe');
    validateColor(properties.coverColor, 'Abdeckungsfarbe');
    validateColor(properties.switchCabinetColor, 'Schaltschrankfarbe');
    validateColor(properties.controlPanelColor, 'Bedienfeld-Farbe');

    // Produktionswoche Format prüfen
    if (properties.productionWeek && !properties.productionWeek.match(/^\d{1,2}\/\d{4}$/)) {
      warnings.push('Produktionswoche sollte im Format "KW/Jahr" sein (z.B. "49/2018")');
    }

    // Kundennummer Format prüfen
    if (properties.customerNumber && properties.customerNumber.length > 20) {
      warnings.push('Kundennummer ist ungewöhnlich lang');
    }

    // Konsistenz prüfen
    if (properties.customerName && !properties.customerNumber) {
      warnings.push('Kundenname ohne Kundennummer angegeben');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Status Helper Functions
  getStatusDisplayName: (status: MachineStatus | string | number): string => {
    if (typeof status === 'number') {
      const englishStatus = MachineStatusMap.toString[status as keyof typeof MachineStatusMap.toString];
      return MachineStatusMap.toGerman[englishStatus] || 'Unbekannt';
    }
    
    if (typeof status === 'string') {
      return MachineStatusMap.toGerman[status as keyof typeof MachineStatusMap.toGerman] || status;
    }
    
    return 'Unbekannt';
  },

  getStatusInteger: (status: string): number => {
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

  /**
   * Magazin-Eigenschaften für Anzeige formatieren
   */
  formatMagazinePropertiesForDisplay: (machine: Machine) => {
    return {
      basic: {
        'Magazin-Typ': machine.magazineType || 'Nicht angegeben',
        'Materialstangenlänge': machine.materialBarLength ? `${machine.materialBarLength} mm` : 'Nicht angegeben',
        'Synchroneinrichtung': machine.hasSynchronizationDevice ? 'Ja' : 'Nein',
        'Zuführkanal': machine.feedChannel || 'Nicht angegeben',
        'Vorschubstange': machine.feedRod || 'Nicht angegeben'
      },
      customer: {
        'Kunde': machine.customerName || 'Nicht angegeben',
        'Kundennummer': machine.customerNumber || 'Nicht angegeben',
        'Kundenprozess': machine.customerProcess || 'Nicht angegeben'
      },
      production: {
        'Produktionswoche': machine.productionWeek || 'Nicht angegeben',
        'Bauvariante': machine.buildVariant || 'Nicht angegeben',
        'Betriebsspannung': machine.operatingVoltage || 'Nicht angegeben'
      },
      colors: {
        'Grundfarbe': machine.baseColor || 'Nicht angegeben',
        'Abdeckungsfarbe': machine.coverColor || 'Nicht angegeben',
        'Schaltschrankfarbe': machine.switchCabinetColor || 'Nicht angegeben',
        'Bedienfeld-Farbe': machine.controlPanelColor || 'Nicht angegeben'
      },
      documentation: {
        'Dokumentationssprache': machine.documentationLanguage || 'Nicht angegeben',
        'Anzahl Dokumentation': machine.documentationCount || 'Nicht angegeben'
      },
      lathe: {
        'Drehmaschinen-Hersteller': machine.latheManufacturer || 'Nicht angegeben',
        'Drehmaschinentyp': machine.latheType || 'Nicht angegeben',
        'Drehmaschinen-Nummer': machine.latheNumber || 'Nicht angegeben',
        'Spindelhöhe': machine.spindleHeight || 'Nicht angegeben',
        'Spindeldurchmesser': machine.spindleDiameter || 'Nicht angegeben'
      },
      electrical: {
        'Magazin-Nummer': machine.magazineNumber || 'Nicht angegeben',
        'Positionsnummer': machine.positionNumber || 'Nicht angegeben',
        'Bedienfeld': machine.controlPanel || 'Nicht angegeben',
        'APM': machine.apm || 'Nicht angegeben',
        'EPROM': machine.eprom || 'Nicht angegeben',
        'Schaltplan': machine.circuitDiagram || 'Nicht angegeben',
        'Zeichnungsliste': machine.drawingList || 'Nicht angegeben'
      },
      article: {
        'Artikelnummer': machine.articleNumber || 'Nicht angegeben'
      },
      metadata: {
        'Letzte Aktualisierung': machine.magazinePropertiesLastUpdated 
          ? new Date(machine.magazinePropertiesLastUpdated).toLocaleString('de-DE')
          : 'Nie',
        'Aktualisiert von': machine.magazinePropertiesUpdatedBy || 'Unbekannt',
        'Notizen': machine.magazinePropertiesNotes || 'Keine'
      }
    };
  }
};

export default machineService;