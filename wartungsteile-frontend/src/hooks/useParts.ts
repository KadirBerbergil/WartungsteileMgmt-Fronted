// src/hooks/useParts.ts
import { useQuery } from '@tanstack/react-query';
import { maintenancePartService, maintenancePartsListService } from '../services';

export function useMaintenanceParts() {
  return useQuery({
    queryKey: ['maintenanceParts'],
    queryFn: maintenancePartService.getAll
  });
}

export function useMaintenancePartDetail(id: string) {
  return useQuery({
    queryKey: ['maintenancePart', id],
    queryFn: () => maintenancePartService.getById(id),
    enabled: !!id
  });
}

export function useMaintenancePartsList(machineNumber: string) {
  return useQuery({
    queryKey: ['maintenancePartsList', machineNumber],
    queryFn: () => maintenancePartsListService.generateForMachine(machineNumber),
    enabled: !!machineNumber
  });
}