import { api } from './api';
import type { MaintenancePart } from '../types/api';

export const maintenancePartService = {
  // Alle Wartungsteile abrufen
  getAll: async (): Promise<MaintenancePart[]> => {
    const response = await api.get('/MaintenanceParts');
    return response.data;
  },
  
  // Wartungsteil nach ID abrufen
  getById: async (id: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/id/${id}`);
    return response.data;
  },
  
  // Wartungsteil nach Teilenummer abrufen
  getByPartNumber: async (partNumber: string): Promise<MaintenancePart> => {
    const response = await api.get(`/MaintenanceParts/partnumber/${partNumber}`);
    return response.data;
  },
  
  // Neues Wartungsteil erstellen
  create: async (part: any): Promise<string> => {
    const response = await api.post('/MaintenanceParts', part);
    return response.data;
  },
  
  // Wartungsteil aktualisieren
  update: async (id: string, part: any): Promise<boolean> => {
    const response = await api.put(`/MaintenanceParts/${id}`, part);
    return response.status === 200;
  },
  
  // Wartungsteil löschen
  delete: async (id: string): Promise<boolean> => {
    const response = await api.delete(`/MaintenanceParts/${id}`);
    return response.status === 204;
  }
};