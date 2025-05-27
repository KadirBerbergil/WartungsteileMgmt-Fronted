// src/hooks/useParts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenancePartService, maintenancePartsListService } from '../services';
import type { MaintenancePart } from '../types/api';

// Alle Wartungsteile laden
export function useMaintenanceParts() {
  return useQuery({
    queryKey: ['maintenanceParts'],
    queryFn: maintenancePartService.getAll,
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
    retry: 2
  });
}

// Einzelnes Wartungsteil laden
export function useMaintenancePartDetail(id: string) {
  return useQuery({
    queryKey: ['maintenancePart', id],
    queryFn: () => maintenancePartService.getById(id),
    enabled: !!id && id !== 'undefined' && id.length > 0,
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
    retry: 2
  });
}

// Wartungsteileliste für spezifische Maschine
export function useMaintenancePartsList(machineNumber: string) {
  return useQuery({
    queryKey: ['maintenancePartsList', machineNumber],
    queryFn: () => maintenancePartsListService.generateForMachine(machineNumber),
    enabled: !!machineNumber && machineNumber.length > 0,
    staleTime: 1000 * 60 * 2, // 2 Minuten Cache (kürzer, da sich ändern kann)
    retry: 2
  });
}

// Wartungsteil erstellen
export function useCreateMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (part: Partial<MaintenancePart>) => maintenancePartService.create(part),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
    }
  });
}

// Wartungsteil aktualisieren
export function useUpdateMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, part }: { id: string; part: Partial<MaintenancePart> }) => 
      maintenancePartService.update(id, part),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePart', id] });
    }
  });
}

// Wartungsteil löschen
export function useDeleteMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => maintenancePartService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
    }
  });
}