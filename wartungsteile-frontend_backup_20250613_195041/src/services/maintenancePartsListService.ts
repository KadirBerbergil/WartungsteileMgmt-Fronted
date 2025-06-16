import { api } from './api';
import type { MaintenancePartsList } from '../types/api';

export const maintenancePartsListService = {
  // Wartungsteileliste für eine Maschine generieren
  generateForMachine: async (machineNumber: string): Promise<MaintenancePartsList> => {
    const response = await api.get(`/MaintenancePartsList/machine/${machineNumber}`);
    return response.data;
  }
};