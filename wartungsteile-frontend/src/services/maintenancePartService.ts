// src/services/maintenancePartService.ts - KORRIGIERTE VERSION ohne Category Mapping
import { api } from './api';
import type { MaintenancePart } from '../types/api';

export const maintenancePartService = {
  // Alle Wartungsteile abrufen - Category als String behandeln
  getAll: async (): Promise<MaintenancePart[]> => {
    const response = await api.get('/MaintenanceParts');
    return response.data.map((part: any) => ({
      ...part,
      // Stelle sicher, dass category ein String ist
      category: typeof part.category === 'number' ? 
        ['WearPart', 'SparePart', 'ConsumablePart', 'ToolPart'][part.category] || 'WearPart' :
        part.category || 'WearPart'
    }));
  },
  
  // Wartungsteil nach ID abrufen - Category als String behandeln
  getById: async (id: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/id/${id}`);
    const part = response.data;
    return {
      ...part,
      // Stelle sicher, dass category ein String ist
      category: typeof part.category === 'number' ? 
        ['WearPart', 'SparePart', 'ConsumablePart', 'ToolPart'][part.category] || 'WearPart' :
        part.category || 'WearPart'
    };
  },
  
  // Wartungsteil nach Teilenummer abrufen - Category als String behandeln
  getByPartNumber: async (partNumber: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/partnumber/${partNumber}`);
    const part = response.data;
    return {
      ...part,
      // Stelle sicher, dass category ein String ist
      category: typeof part.category === 'number' ? 
        ['WearPart', 'SparePart', 'ConsumablePart', 'ToolPart'][part.category] || 'WearPart' :
        part.category || 'WearPart'
    };
  },
  
  // Neues Wartungsteil erstellen - Category als String senden
  create: async (part: any): Promise<string> => {
    // Backend sollte String-Categories akzeptieren
    const backendData = {
      ...part,
      // Category als String senden - Backend-kompatibel
      category: part.category || 'WearPart'
    };
    
    console.log('📤 Sende Wartungsteil-Daten:', backendData);
    
    try {
      const response = await api.post('/MaintenanceParts', backendData);
      console.log('✅ Wartungsteil erfolgreich erstellt:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fehler beim Erstellen des Wartungsteils:', error);
      
      // Falls Backend noch Zahlen erwartet, als Fallback konvertieren
      if (error.response?.status === 400 && error.response?.data?.includes?.('category')) {
        console.warn('⚠️ Backend erwartet noch Zahlen-Categories, konvertiere...');
        const categoryMapping: Record<string, number> = {
          'WearPart': 0,
          'SparePart': 1,
          'ConsumablePart': 2,
          'ToolPart': 3
        };
        
        const fallbackData = {
          ...backendData,
          category: categoryMapping[part.category] ?? 0
        };
        
        const fallbackResponse = await api.post('/MaintenanceParts', fallbackData);
        return fallbackResponse.data;
      }
      
      throw error;
    }
  },
  
  // Wartungsteil aktualisieren - Category als String senden
  update: async (id: string, part: any): Promise<boolean> => {
    // Backend sollte String-Categories akzeptieren
    const backendData = {
      ...part,
      // Category als String senden - Backend-kompatibel
      category: part.category || 'WearPart'
    };
    
    console.log('📤 Aktualisiere Wartungsteil-Daten:', backendData);
    
    try {
      const response = await api.put(`/MaintenanceParts/${id}`, backendData);
      console.log('✅ Wartungsteil erfolgreich aktualisiert');
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Fehler beim Aktualisieren des Wartungsteils:', error);
      
      // Falls Backend noch Zahlen erwartet, als Fallback konvertieren
      if (error.response?.status === 400 && error.response?.data?.includes?.('category')) {
        console.warn('⚠️ Backend erwartet noch Zahlen-Categories, konvertiere...');
        const categoryMapping: Record<string, number> = {
          'WearPart': 0,
          'SparePart': 1,
          'ConsumablePart': 2,
          'ToolPart': 3
        };
        
        const fallbackData = {
          ...backendData,
          category: categoryMapping[part.category] ?? 0
        };
        
        const fallbackResponse = await api.put(`/MaintenanceParts/${id}`, fallbackData);
        return fallbackResponse.status === 200;
      }
      
      throw error;
    }
  },
  
  // Wartungsteil löschen - unverändert
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/MaintenanceParts/${id}`);
      return response.status === 204;
    } catch (error: any) {
      console.error('❌ Fehler beim Löschen des Wartungsteils:', error);
      throw error;
    }
  }
};