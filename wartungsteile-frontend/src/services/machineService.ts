// src/services/machineService.ts - Erweitert mit allen Magazin-Eigenschaften APIs
import { api } from './api';
import type { 
  Machine, 
  MachineDetail, 
  UpdateMagazinePropertiesCommand, 
  ExtractedMachineData 
} from '../types/api';

export const machineService = {
  // ========================================
  // BASIS MASCHINEN-OPERATIONS (unverändert)
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
      const response = await api.put(`/Machines/${machineId}/magazine`, properties);
      
      // Backend könnte Vollständigkeits-Info zurückgeben
      const result = {
        success: response.status === 200,
        completeness: response.data?.completeness || undefined
      };
      
      console.log('✅ Magazin-Eigenschaften erfolgreich aktualisiert:', result);
      return result;
      
    } catch (error: any) {
      console.error('❌ Fehler beim Aktualisieren der Magazin-Eigenschaften:', error);
      throw error;
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
      
      const result = {
        success: response.status === 200,
        fieldsSet: response.data?.fieldsSet || 0,
        completeness: response.data?.completeness || undefined
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
      const machine = await this.getById(machineId);
      return this.calculateCompletenessClientSide(machine);
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
        const machineId = await this.create(machineData);
        
        // 2. Magazin-Eigenschaften setzen
        await this.updateMagazineProperties(machineId, magazineProperties);
        
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
  // VALIDIERUNG UND HELPER
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