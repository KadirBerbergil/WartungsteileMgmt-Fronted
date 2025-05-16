// src/hooks/useParts.ts
import { useQuery } from '@tanstack/react-query';
import { maintenancePartService } from '../services';

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