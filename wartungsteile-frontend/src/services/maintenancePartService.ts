import { api } from './api';
import type { MaintenancePart } from '../types/api';

// Category-Mapping hinzufügen
const CategoryMapping = {
  'WearPart': 0,
  'SparePart': 1,
  'ConsumablePart': 2,
  'ToolPart': 3
};

const CategoryReverseMapping = {
  0: 'WearPart',
  1: 'SparePart', 
  2: 'ConsumablePart',
  3: 'ToolPart'
};

export const maintenancePartService = {
  // Alle Wartungsteile abrufen - Category-Konvertierung hinzugefügt
  getAll: async (): Promise<MaintenancePart[]> => {
    const response = await api.get('/MaintenanceParts');
    return response.data.map((part: any) => ({
      ...part,
      category: CategoryReverseMapping[part.category as keyof typeof CategoryReverseMapping] || part.category
    }));
  },
  
  // Wartungsteil nach ID abrufen - Category-Konvertierung hinzugefügt
  getById: async (id: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/id/${id}`);
    const part = response.data;
    return {
      ...part,
      category: CategoryReverseMapping[part.category as keyof typeof CategoryReverseMapping] || part.category
    };
  },
  
  // Wartungsteil nach Teilenummer abrufen - Category-Konvertierung hinzugefügt
  getByPartNumber: async (partNumber: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/partnumber/${partNumber}`);
    const part = response.data;
    return {
      ...part,
      category: CategoryReverseMapping[part.category as keyof typeof CategoryReverseMapping] || part.category
    };
  },
  
  // Neues Wartungsteil erstellen - Category-Konvertierung hinzugefügt
  create: async (part: any): Promise<string> => {
    // Category von String zu Zahl konvertieren
    const backendData = {
      ...part,
      category: CategoryMapping[part.category as keyof typeof CategoryMapping] ?? 0
    };
    
    const response = await api.post('/MaintenanceParts', backendData);
    return response.data;
  },
  
  // Wartungsteil aktualisieren - Category-Konvertierung hinzugefügt
  update: async (id: string, part: any): Promise<boolean> => {
    // Category von String zu Zahl konvertieren
    const backendData = {
      ...part,
      category: CategoryMapping[part.category as keyof typeof CategoryMapping] ?? 0
    };
    
    const response = await api.put(`/MaintenanceParts/${id}`, backendData);
    return response.status === 200;
  },
  
  // Wartungsteil löschen - unverändert
  delete: async (id: string): Promise<boolean> => {
    const response = await api.delete(`/MaintenanceParts/${id}`);
    return response.status === 204;
  }
};