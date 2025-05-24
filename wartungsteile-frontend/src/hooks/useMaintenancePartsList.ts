// src/hooks/useMaintenancePartsList.ts
import { useQuery } from '@tanstack/react-query';
import { maintenancePartsListService } from '../services';

export function useMaintenancePartsList(machineNumber: string) {
  return useQuery({
    queryKey: ['maintenancePartsList', machineNumber],
    queryFn: () => maintenancePartsListService.generateForMachine(machineNumber),
    enabled: !!machineNumber
  });
}