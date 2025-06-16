import { api } from './api';
import type { MachinePartCompatibility, CompatiblePart } from '../types/api';

export const compatibilityService = {
  // Kompatibilitätseintrag nach ID abrufen
  getById: async (id: string): Promise<MachinePartCompatibility> => {
    const response = await api.get(`/MachinePartCompatibility/${id}`);
    return response.data;
  },
  
  // Kompatible Teile für eine Maschine abrufen
  getForMachine: async (machineNumber: string): Promise<CompatiblePart[]> => {
    const response = await api.get(`/MachinePartCompatibility/machine/${machineNumber}`);
    return response.data;
  },
  
  // Kompatible Teile nach Suchkriterien abrufen
  search: async (series?: string, yearCode?: string, modelCode?: string): Promise<CompatiblePart[]> => {
    let url = '/MachinePartCompatibility/search';
    const params = new URLSearchParams();
    
    if (series) params.append('series', series);
    if (yearCode) params.append('yearCode', yearCode);
    if (modelCode) params.append('modelCode', modelCode);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  
  // Neuen Kompatibilitätseintrag erstellen
  create: async (compatibility: any): Promise<string> => {
    const response = await api.post('/MachinePartCompatibility', compatibility);
    return response.data;
  },
  
  // Kompatibilitätseintrag aktualisieren
  update: async (id: string, compatibility: any): Promise<boolean> => {
    const response = await api.put(`/MachinePartCompatibility/${id}`, compatibility);
    return response.status === 204;
  },
  
  // Kompatibilitätseintrag löschen
  delete: async (id: string): Promise<boolean> => {
    const response = await api.delete(`/MachinePartCompatibility/${id}`);
    return response.status === 204;
  }
};