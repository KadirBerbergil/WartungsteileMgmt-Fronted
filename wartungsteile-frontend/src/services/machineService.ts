import { api } from './api';
import type { Machine, MachineDetail } from '../types/api';

export const machineService = {
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
  
  // Maschine aktualisieren
  update: async (id: string, machine: any): Promise<boolean> => {
    const response = await api.put(`/Machines/${id}`, machine);
    return response.status === 200;
  },
  
  // Magazin-Eigenschaften aktualisieren
  updateMagazine: async (id: string, magazineProps: any): Promise<boolean> => {
    const response = await api.put(`/Machines/${id}/magazine`, magazineProps);
    return response.status === 200;
  },
  
  // Betriebsstunden aktualisieren
  updateOperatingHours: async (id: string, hours: number): Promise<boolean> => {
    const response = await api.put(`/Machines/${id}/operatinghours`, { machineId: id, newOperatingHours: hours });
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
  }
};