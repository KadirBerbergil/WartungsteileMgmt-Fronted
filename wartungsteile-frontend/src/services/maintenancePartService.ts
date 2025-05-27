// src/services/maintenancePartService.ts - KORRIGIERTE VERSION für Backend-Kompatibilität
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
  
  // ✅ KORRIGIERT: Neues Wartungsteil erstellen - CreateMaintenancePartCommand Struktur
  create: async (part: any): Promise<string> => {
    // ✅ CreateMaintenancePartCommand - keine ID erforderlich
    const createCommand = {
      partNumber: part.partNumber?.trim() || '',
      name: part.name?.trim() || '',
      description: part.description?.trim() || '',
      category: part.category || 'WearPart', // String-Category
      price: Number(part.price) || 0,
      manufacturer: part.manufacturer?.trim() || '',
      stockQuantity: Number(part.stockQuantity) || 0
    };
    
    console.log('📤 Sende CreateMaintenancePartCommand:', createCommand);
    
    try {
      const response = await api.post('/MaintenanceParts', createCommand);
      console.log('✅ Wartungsteil erfolgreich erstellt:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fehler beim Erstellen des Wartungsteils:', error);
      
      // Falls Backend noch Zahlen erwartet, als Fallback konvertieren
      if (error.response?.status === 400) {
        console.warn('⚠️ Backend-Validierungsfehler, versuche Category-Mapping...');
        const categoryMapping: Record<string, number> = {
          'WearPart': 0,
          'SparePart': 1,
          'ConsumablePart': 2,
          'ToolPart': 3
        };
        
        const fallbackCommand = {
          ...createCommand,
          category: categoryMapping[part.category] ?? 0 // Fallback zu Zahl
        };
        
        console.log('📤 Fallback mit Zahlen-Category:', fallbackCommand);
        const fallbackResponse = await api.post('/MaintenanceParts', fallbackCommand);
        return fallbackResponse.data;
      }
      
      throw error;
    }
  },
  
  // ✅ KORRIGIERT: Wartungsteil aktualisieren - UpdateMaintenancePartCommand Struktur
  update: async (id: string, part: any): Promise<boolean> => {
    // ✅ UpdateMaintenancePartCommand - KEINE ID im Body!
    const updateCommand = {
      // ❌ id: id, // ENTFERNT - Controller setzt command.Id = id
      name: part.name?.trim() || '',
      description: part.description?.trim() || '',
      category: part.category || 'WearPart', // String-Category
      price: Number(part.price) || 0,
      manufacturer: part.manufacturer?.trim() || '',
      stockQuantity: Number(part.stockQuantity) || 0
    };
    
    console.log('📤 Sende UpdateMaintenancePartCommand:', updateCommand);
    console.log('📤 Update-URL:', `/MaintenanceParts/${id}`);
    
    try {
      const response = await api.put(`/MaintenanceParts/${id}`, updateCommand);
      console.log('✅ Wartungsteil erfolgreich aktualisiert:', {
        status: response.status,
        statusText: response.statusText
      });
      return response.status === 200 || response.status === 204;
    } catch (error: any) {
      console.error('❌ Fehler beim Aktualisieren des Wartungsteils:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `/MaintenanceParts/${id}`,
        sentData: updateCommand
      });
      
      // Falls Backend noch Zahlen erwartet, als Fallback konvertieren
      if (error.response?.status === 400) {
        console.warn('⚠️ Backend-Validierungsfehler, versuche Category-Mapping...');
        const categoryMapping: Record<string, number> = {
          'WearPart': 0,
          'SparePart': 1,
          'ConsumablePart': 2,
          'ToolPart': 3
        };
        
        const fallbackCommand = {
          ...updateCommand,
          category: categoryMapping[part.category] ?? 0 // Fallback zu Zahl
        };
        
        console.log('📤 Fallback mit Zahlen-Category:', fallbackCommand);
        const fallbackResponse = await api.put(`/MaintenanceParts/${id}`, fallbackCommand);
        return fallbackResponse.status === 200 || fallbackResponse.status === 204;
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